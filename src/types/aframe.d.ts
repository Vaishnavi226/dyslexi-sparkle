// A-Frame type definitions
declare module 'aframe' {
  const aframe: any;
  export default aframe;
}

declare namespace JSX {
  interface IntrinsicElements {
    'a-scene': any;
    'a-entity': any;
    'a-camera': any;
    'a-marker': any;
    'a-box': any;
    'a-sphere': any;
    'a-cylinder': any;
    'a-plane': any;
    'a-text': any;
    'a-sky': any;
    'a-light': any;
    'a-animation': any;
    'a-assets': any;
    'a-asset-item': any;
  }
}
