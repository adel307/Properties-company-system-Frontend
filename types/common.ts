export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export interface NavbarProps {
  onMenuToggle?: () => void;
}

export interface AudioRecorderProps {
  onAnalysisComplete?: (data: { text: string; analysis: string }) => void;
  onTranscriptChange?: (text: string) => void;
}