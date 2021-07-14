export class AnimationPack {
    name: string;
    animations: Animation[]
}

export class Animation {
    id: number;
    title: string;
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    p5: number;

    hasP1: boolean;
    p1Min: number;
    p1Max: number;

    allowColor: boolean;
    allowBrightness: boolean;
};
