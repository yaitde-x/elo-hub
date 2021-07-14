
export class RegisterMap {
    name: string;
    label: string;
    description: string;
    preferredRender: string;
    factor: number;
    format: string;
    suffix: string;
};

export class InputRegisterMap {
    p1: RegisterMap | string;
    p2: RegisterMap | string;
    p3: RegisterMap | string;
    p4: RegisterMap | string;
    p5: RegisterMap | string;
};

export class OutputRegisterMap {
    v1: RegisterMap | string;
    v2: RegisterMap | string;
    v3: RegisterMap | string;
    v4: RegisterMap | string;
    v5: RegisterMap | string;
};

export class ConfigRegisterMap {
    c1: RegisterMap | string;
    c2: RegisterMap | string;
    c3: RegisterMap | string;
    c4: RegisterMap | string;
    c5: RegisterMap | string;
};
