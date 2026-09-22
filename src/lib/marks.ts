const serviceIcons: Record<string, string> = {
  'Building construction': 'building',
  'Road construction': 'road',
  'Civil works': 'square',
  'RCC and concrete': 'rebar',
  'Brick and masonry': 'brick',
  'Government and infrastructure': 'column',
  'Plotting development': 'plot',
};

const stepIcons = ['desk', 'tripod', 'sheet', 'gear', 'shield', 'clock'];

export function serviceIcon(title: string) {
  return serviceIcons[title] || 'square';
}

export function stepIcon(index: number) {
  return stepIcons[index] || 'square';
}

export function plantIcon(name: string) {
  const label = name.toLowerCase();
  if (label.includes('roller')) return 'roller';
  if (label.includes('tipper')) return 'tipper';
  if (label.includes('grader')) return 'grader';
  if (label.includes('backhoe') || label.includes('poclain') || label.includes('hammer')) return 'arm';
  if (label.includes('tractor')) return 'wheel';
  if (label.includes('mixer') || label.includes('plant')) return 'drum';
  return 'gear';
}

export function resourceIcon(kind: string) {
  return kind.toLowerCase().includes('image') ? 'frame' : 'sheet';
}
