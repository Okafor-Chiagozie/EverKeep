export const getRelationshipColor = (relationship: string) => {
  switch (relationship?.toLowerCase()) {
    case 'family':
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        icon: 'text-blue-400'
      };
    case 'friend':
      return {
        bg: 'bg-pink-500/20',
        text: 'text-pink-400',
        border: 'border-pink-500/30',
        icon: 'text-pink-400'
      };
    case 'colleague':
      return {
        bg: 'bg-purple-500/20',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        icon: 'text-purple-400'
      };
    case 'home':
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        icon: 'text-green-400'
      };
    default:
      return {
        bg: 'bg-slate-500/20',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        icon: 'text-slate-400'
      };
  }
};

export const getRelationshipIconColor = (relationship: string) => {
  switch (relationship?.toLowerCase()) {
    case 'family':
      return 'text-blue-400';
    case 'friend':
      return 'text-pink-400';
    case 'colleague':
      return 'text-purple-400';
    case 'home':
      return 'text-green-400';
    default:
      return 'text-slate-400';
  }
};

export const getRelationshipCardColor = (relationship: string) => {
  switch (relationship?.toLowerCase()) {
    case 'family':
      return 'blue';
    case 'friend':
      return 'pink';
    case 'colleague':
      return 'purple';
    case 'home':
      return 'green';
    default:
      return 'slate';
  }
}; 