
export class KnowledgeDoc {
    name: string;
    path: string;
    items: IKnowledgeItem[];
    originalDocument: string[];
    summary: SummaryItem;

    constructor() {
        this.items = [];
        this.originalDocument = [];
    }
};

export interface IKnowledgeItem {
    itemType: string;
};

export class KnowledgeItemBase implements IKnowledgeItem {
    public itemType: string;

    constructor(itemType: string) {
        this.itemType = itemType;
    }
};

export class SummaryItem extends KnowledgeItemBase {
    constructor(text: string) {
        super('summary');
        this.text = text;
    };

    public text : string;
}