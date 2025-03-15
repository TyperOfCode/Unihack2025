
export enum TranscriptItemType {
  CHAT = 'chat',
  TOOL = 'tool',
}

export interface TranscriptItem {
  type: TranscriptItemType;
  text: string;
}