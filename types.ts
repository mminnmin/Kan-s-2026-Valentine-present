
export type Page = 'home' | 'gallery' | 'tutorial' | 'game' | 'letters' | 'final';

export interface Envelope {
  id: number;
  type: 'striped' | 'red' | 'white' | 'black';
  status: 'read' | 'unread';
  message: string;
  image: string;
  title: string;
}

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'cue' | 'red' | 'striped';
  isPocketed: boolean;
}

export interface PostItPhoto {
  id: number;
  url: string;
  rotation: number;
  x: number;
  y: number;
}
