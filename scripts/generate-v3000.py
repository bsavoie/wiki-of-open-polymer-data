#!/usr/bin/env python3
"""Generate migration-only, coordinate-bearing V3000 records from reviewed specs.

The output of this helper is a migration intermediate. Runtime builds never
invoke RDKit or regenerate coordinates. A definition becomes canonical only
after the corresponding explicit evidence selection, connection table, and
rendered contact-sheet result have been curated and marked reviewed.
"""

import json
import math
import re
import sys

from rdkit import Chem
from rdkit.Chem import AllChem
from rdkit.Geometry import Point2D, Point3D


def rotate_repeat_axis(molecule, conformer, dummy_indices):
    if len(dummy_indices) != 2:
        return
    first = conformer.GetAtomPosition(dummy_indices[0])
    second = conformer.GetAtomPosition(dummy_indices[1])
    angle = math.atan2(second.y - first.y, second.x - first.x)
    cosine = math.cos(-angle)
    sine = math.sin(-angle)
    center_x = (first.x + second.x) / 2
    center_y = (first.y + second.y) / 2
    for atom_index in range(molecule.GetNumAtoms()):
        point = conformer.GetAtomPosition(atom_index)
        x = point.x - center_x
        y = point.y - center_y
        conformer.SetAtomPosition(atom_index, Point3D(
            x * cosine - y * sine,
            x * sine + y * cosine,
            0,
        ))


def repair_terminal_overlap(molecule, conformer, dummy_indices):
    """Move a colliding terminal linker tail outward without relaying out the graph."""
    dummy_set = set(dummy_indices)
    for dummy_index in dummy_indices:
        dummy = molecule.GetAtomWithIdx(dummy_index)
        if dummy.GetDegree() != 1:
            continue
        linker = dummy.GetNeighbors()[0]
        if linker.GetDegree() != 2:
            continue
        linker_index = linker.GetIdx()
        anchor = next(neighbor for neighbor in linker.GetNeighbors() if neighbor.GetIdx() != dummy_index)
        linker_point = conformer.GetAtomPosition(linker_index)
        collides = any(
            other_index not in {dummy_index, linker_index, anchor.GetIdx()}
            and molecule.GetBondBetweenAtoms(linker_index, other_index) is None
            and math.hypot(
                linker_point.x - conformer.GetAtomPosition(other_index).x,
                linker_point.y - conformer.GetAtomPosition(other_index).y,
            ) < 0.4
            for other_index in range(molecule.GetNumAtoms())
        )
        if not collides:
            continue

        internal_indices = [
            index for index in range(molecule.GetNumAtoms())
            if index not in dummy_set and index != linker_index
        ]
        center_x = sum(conformer.GetAtomPosition(index).x for index in internal_indices) / len(internal_indices)
        center_y = sum(conformer.GetAtomPosition(index).y for index in internal_indices) / len(internal_indices)
        anchor_point = conformer.GetAtomPosition(anchor.GetIdx())
        outward_x = anchor_point.x - center_x
        outward_y = anchor_point.y - center_y
        length = math.hypot(outward_x, outward_y)
        if length < 1e-6:
            outward_x = anchor_point.x - linker_point.x
            outward_y = anchor_point.y - linker_point.y
            length = math.hypot(outward_x, outward_y) or 1
        outward_x /= length
        outward_y /= length
        conformer.SetAtomPosition(linker_index, Point3D(
            anchor_point.x + 1.5 * outward_x,
            anchor_point.y + 1.5 * outward_y,
            0,
        ))
        conformer.SetAtomPosition(dummy_index, Point3D(
            anchor_point.x + 3.0 * outward_x,
            anchor_point.y + 3.0 * outward_y,
            0,
        ))


def add_block_sgroups(molecule, conformer, dummy_indices, specification):
    """Delimit one connected A-B-... architecture as independent block SRUs.

    One outer ``[ABA]n`` group would assert repetition of the whole finite
    segment. Instead, each contiguous backbone slice receives its own SRU and
    length label. Interior brackets are placed on different thirds of the
    inter-block bond so both block boundaries remain legible.
    """
    if len(dummy_indices) != 2:
        raise ValueError('block architectures require exactly two terminal wildcards')
    counts = specification.get('blockBackboneCounts')
    labels = specification.get('blockLabels')
    if (not isinstance(counts, list) or not counts or
            any(not isinstance(count, int) or count <= 0 for count in counts)):
        raise ValueError('blockBackboneCounts must be a non-empty list of positive integers')
    if not isinstance(labels, list) or len(labels) != len(counts) or any(not label for label in labels):
        raise ValueError('blockLabels must provide one non-empty label per block')
    connect = specification.get('connect', 'HT')
    if connect not in {'HT', 'HH', 'EU'}:
        raise ValueError('polymer S-group connect must be HT, HH, or EU')

    path = list(Chem.rdmolops.GetShortestPath(molecule, *dummy_indices))
    if {path[0], path[-1]} != set(dummy_indices):
        raise ValueError('terminal wildcards do not bound one backbone path')
    internal_path = path[1:-1]
    if sum(counts) != len(internal_path):
        raise ValueError(
            f'blockBackboneCounts sum to {sum(counts)}, but the internal backbone has {len(internal_path)} atoms'
        )
    backbone_set = set(path)
    non_dummy_points = [
        conformer.GetAtomPosition(index)
        for index in range(molecule.GetNumAtoms())
        if index not in dummy_indices
    ]
    global_y_min = min(point.y for point in non_dummy_points) - 0.55
    global_y_max = max(point.y for point in non_dummy_points) + 0.55
    cursor = 0
    for block_index, (count, label) in enumerate(zip(counts, labels)):
        segment = internal_path[cursor:cursor + count]
        cursor += count
        segment_set = set(segment)
        group_atoms = set(segment)
        queue = list(segment)
        while queue:
            atom_index = queue.pop()
            for neighbor in molecule.GetAtomWithIdx(atom_index).GetNeighbors():
                neighbor_index = neighbor.GetIdx()
                if neighbor_index in group_atoms or neighbor_index in dummy_indices:
                    continue
                if neighbor_index in backbone_set and neighbor_index not in segment_set:
                    continue
                group_atoms.add(neighbor_index)
                queue.append(neighbor_index)

        left_internal = segment[0]
        right_internal = segment[-1]
        left_external = path[path.index(left_internal) - 1]
        right_external = path[path.index(right_internal) + 1]
        boundary_pairs = [
            (left_internal, left_external),
            (right_internal, right_external),
        ]
        crossing_bonds = [
            molecule.GetBondBetweenAtoms(internal, external).GetIdx()
            for internal, external in boundary_pairs
        ]

        group = Chem.CreateMolSubstanceGroup(molecule, 'SRU')
        group.SetAtoms(sorted(group_atoms))
        group.SetBonds(crossing_bonds)
        group.SetProp('CONNECT', connect)
        group.SetProp('LABEL', str(label))

        for internal, external in boundary_pairs:
            internal_point = conformer.GetAtomPosition(internal)
            external_point = conformer.GetAtomPosition(external)
            terminal_boundary = external in dummy_indices
            fraction = 0.5 if terminal_boundary else 0.35
            x = internal_point.x + fraction * (external_point.x - internal_point.x)
            group.AddBracket((Point3D(x, global_y_min, 0), Point3D(x, global_y_max, 0)))


def add_polymer_sgroup(molecule, conformer, dummy_indices, specification=None):
    # A finite or network motif can legitimately have exactly two open
    # continuation points without claiming that the whole drawing is an SRU.
    # Curators must opt out explicitly so two wildcards are never silently
    # promoted to repeat brackets.
    if specification is False:
        return
    if len(dummy_indices) != 2:
        return
    specification = specification or {'type': 'SRU', 'connect': 'HT', 'label': 'n'}
    if specification.get('blockBackboneCounts') is not None:
        add_block_sgroups(molecule, conformer, dummy_indices, specification)
        return
    group_type = specification.get('type', 'SRU')
    if group_type not in {'SRU', 'COP'}:
        raise ValueError(f'unsupported polymer S-group type {group_type!r}')
    subtype = specification.get('subtype')
    if group_type == 'COP' and subtype not in {'ALT', 'BLO', 'RAN'}:
        raise ValueError('COP polymer S-groups require subtype ALT, BLO, or RAN')
    if group_type == 'SRU' and subtype is not None:
        raise ValueError('SRU polymer S-groups cannot carry a copolymer subtype')
    connect = specification.get('connect', 'HT')
    if connect not in {'HT', 'HH', 'EU'}:
        raise ValueError('polymer S-group connect must be HT, HH, or EU')
    fragments = [set(fragment) for fragment in Chem.GetMolFrags(molecule)]
    repeat_fragment = next(
        (fragment for fragment in fragments if set(dummy_indices).issubset(fragment)),
        None,
    )
    if repeat_fragment is None:
        return
    crossing_bonds = []
    for dummy_index in dummy_indices:
        atom = molecule.GetAtomWithIdx(dummy_index)
        if atom.GetDegree() != 1:
            raise ValueError('terminal wildcard atoms must each have exactly one bond')
        bond = atom.GetBonds()[0]
        crossing_bonds.append(bond.GetIdx())
    internal_atoms = sorted(repeat_fragment.difference(dummy_indices))
    if not internal_atoms:
        raise ValueError('repeat segment has no atoms inside its terminal wildcards')

    group = Chem.CreateMolSubstanceGroup(molecule, group_type)
    group.SetAtoms(internal_atoms)
    group.SetBonds(crossing_bonds)
    group.SetProp('CONNECT', connect)
    group.SetProp('LABEL', specification.get('label', 'n'))
    if subtype:
        group.SetProp('SUBTYPE', subtype)

    points = [conformer.GetAtomPosition(index) for index in repeat_fragment]
    y_min = min(point.y for point in points) - 0.55
    y_max = max(point.y for point in points) + 0.55
    bracket_x = []
    for dummy_index in dummy_indices:
        dummy = molecule.GetAtomWithIdx(dummy_index)
        neighbor_index = dummy.GetNeighbors()[0].GetIdx()
        dummy_point = conformer.GetAtomPosition(dummy_index)
        neighbor_point = conformer.GetAtomPosition(neighbor_index)
        bracket_x.append((dummy_point.x + neighbor_point.x) / 2)
    for x in sorted(bracket_x):
        group.AddBracket((Point3D(x, y_min, 0), Point3D(x, y_max, 0)))


def serialize_attachment_pseudoatoms(block, dummy_indices):
    """Emit explicit `*` continuation points instead of misleading terminal caps."""
    attachment_ids = {index + 1 for index in dummy_indices}
    output = []
    for line in block.splitlines():
        match = re.match(r'^M  V30 (\d+) R (.*?)(?: VAL=1)?$', line)
        if match and int(match.group(1)) in attachment_ids:
            line = f'M  V30 {match.group(1)} * {match.group(2)}'
        output.append(line)
    return '\n'.join(output).rstrip() + '\n'


def configure_markush_atoms(molecule, specification):
    """Turn explicitly mapped migration dummies into visible Markush R groups.

    Atom maps are only an authoring-time selector here. They are removed before
    V3000 serialization. ``R`` produces a plain generic R atom; ``R1`` through
    ``R32`` produce standard V3000 ``R#`` atoms with one ``RGROUPS`` label.
    Un-mapped dummy atoms remain polymer continuation points that are later
    serialized as ``*`` and hidden only in the display SVG.
    """
    labels = specification.get('markushLabels', {})
    if labels is None:
        labels = {}
    label_pattern = re.compile(r'^R(?:[1-9]|[12][0-9]|3[0-2])?$')
    if not isinstance(labels, dict) or any(
        not str(map_number).isdigit() or int(map_number) <= 0 or
        not isinstance(label, str) or not label_pattern.fullmatch(label)
        for map_number, label in labels.items()
    ):
        raise ValueError('markushLabels must map positive atom-map numbers to R or R1 through R32')
    expected = {int(map_number) for map_number in labels}
    found = set()
    markush_indices = set()
    for atom in molecule.GetAtoms():
        map_number = atom.GetAtomMapNum()
        if map_number == 0:
            continue
        if atom.GetAtomicNum() != 0 or map_number not in expected:
            raise ValueError(
                f'atom map {map_number} is not a declared generic Markush dummy atom'
            )
        atom.SetAtomMapNum(0)
        label = labels[str(map_number)] if str(map_number) in labels else labels[map_number]
        if label != 'R':
            atom.SetIntProp('_MolFileRLabel', int(label[1:]))
        found.add(map_number)
        markush_indices.add(atom.GetIdx())
    if found != expected:
        missing = ', '.join(str(value) for value in sorted(expected.difference(found)))
        raise ValueError(f'markushLabels names missing mapped dummy atom(s): {missing}')
    return markush_indices


def mark_unassigned_tetrahedral_stereo(molecule, dummy_indices):
    """Encode unresolved tactic centers as an explicit wavy single bond."""
    dummy_set = set(dummy_indices)
    for center_index, assignment in Chem.FindMolChiralCenters(
        molecule,
        includeUnassigned=True,
        includeCIP=False,
        useLegacyImplementation=False,
    ):
        if assignment != '?':
            continue
        center = molecule.GetAtomWithIdx(center_index)
        candidates = sorted(
            center.GetBonds(),
            key=lambda bond: (
                bond.GetOtherAtomIdx(center_index) in dummy_set,
                bond.GetOtherAtom(center).GetDegree() == 1,
                bond.GetOtherAtom(center).GetAtomicNum() != 6,
                bond.GetIdx(),
            ),
        )
        if candidates:
            candidates[0].SetBondDir(Chem.BondDir.UNKNOWN)


def make_v3000(record):
    structure_id = record['structureId']
    smiles = record['smiles']
    molecule = Chem.MolFromSmiles(smiles)
    if molecule is None:
        raise ValueError(f'RDKit could not parse migration SMILES for {structure_id}')
    molecule.SetProp('_Name', structure_id)
    polymer_sgroup = record.get('polymerSgroup')
    markush_indices = configure_markush_atoms(molecule, record)
    dummy_indices = [
        atom.GetIdx() for atom in molecule.GetAtoms()
        if atom.GetAtomicNum() == 0 and atom.GetIdx() not in markush_indices
    ]
    coordinate_map = None
    canonical_orientation = True
    if polymer_sgroup and polymer_sgroup.get('linearizeBackbone'):
        if len(dummy_indices) != 2:
            raise ValueError('linearized polymer backbones require exactly two terminal wildcards')
        backbone = Chem.rdmolops.GetShortestPath(molecule, *dummy_indices)
        last_position = len(backbone) - 1
        coordinate_map = {
            atom_index: Point2D(
                position * 1.5,
                0 if position in {0, last_position} else (0.5 if position % 2 else -0.5),
            )
            for position, atom_index in enumerate(backbone)
        }
        canonical_orientation = False
    if AllChem.Compute2DCoords(
        molecule,
        canonOrient=canonical_orientation,
        clearConfs=True,
        coordMap=coordinate_map or {},
    ) < 0:
        raise ValueError(f'RDKit could not generate 2D coordinates for {structure_id}')
    conformer = molecule.GetConformer()
    repair_terminal_overlap(molecule, conformer, dummy_indices)
    rotate_repeat_axis(molecule, conformer, dummy_indices)
    add_polymer_sgroup(molecule, conformer, dummy_indices, polymer_sgroup)
    # Plain bonds are the corpus default for a center whose configuration is
    # simply outside the article claim. Curators must opt in when an explicit
    # unknown configuration is itself scientifically important; otherwise a
    # forest of wavy bonds is easily mistaken for polymer continuation.
    unknown_tetrahedral_stereo = record.get('unknownTetrahedralStereo', False)
    if not isinstance(unknown_tetrahedral_stereo, bool):
        raise ValueError('unknownTetrahedralStereo must be true or false')
    if unknown_tetrahedral_stereo:
        mark_unassigned_tetrahedral_stereo(molecule, dummy_indices)
    Chem.WedgeMolBonds(molecule, conformer)
    block = Chem.MolToMolBlock(
        molecule,
        includeStereo=True,
        kekulize=True,
        forceV3000=True,
    ).replace('\r\n', '\n').rstrip() + '\n'
    block = serialize_attachment_pseudoatoms(block, dummy_indices)
    if 'M  V30 BEGIN CTAB' not in block:
        raise ValueError(f'RDKit did not emit V3000 for {structure_id}')
    return block


def main():
    records = json.load(sys.stdin)
    generated = []
    for record in records:
        try:
            parsed = Chem.MolFromSmiles(record['smiles'])
            if parsed is None:
                raise ValueError('RDKit could not parse migration SMILES')
            generated.append({
                'structureId': record['structureId'],
                'molfileV3000': make_v3000(record),
                '_migrationCanonicalSmiles': Chem.MolToSmiles(
                    parsed,
                    canonical=True,
                    isomericSmiles=True,
                ),
            })
        except Exception as error:
            raise RuntimeError(f"{record.get('structureId', '<unknown>')}: {error}") from error
    json.dump(generated, sys.stdout, ensure_ascii=False)


if __name__ == '__main__':
    main()
