import * as fs from 'fs';
import * as filewatcher from 'filewatcher';
import * as path from 'path';
import * as readline from 'readline';
import { KnowledgeDoc, KnowledgeItemBase, SummaryItem } from "./knowledge_doc";


export class ParserState {
    constructor() {
        this.doc = new KnowledgeDoc();
        this.inSummary = false;
        this.inText = false;
    }

    public doc: KnowledgeDoc;
    public inSummary: boolean;
    public inText: boolean;
    public currentItem: KnowledgeItemBase;
};

export interface IKnowledgeDocConfig {
    repoRoot: string;
};

export class KnowledgeDocParser {

    private parserState: ParserState;
    private fullPathToDocument: string;

    constructor(fullPathToDocument: string) {
        this.fullPathToDocument = fullPathToDocument;
        this.parserState = new ParserState();
    }

    public parseDocument(): Promise<KnowledgeDoc> {

        return this.readFile2();

    }

    private readFile2(): Promise<KnowledgeDoc> {
        let self = this;

        return new Promise<KnowledgeDoc>((resolve, reject) => {

            var input = fs.createReadStream(self.fullPathToDocument);
            let lineReader = readline.createInterface({
                input: input,
                terminal: false
            });

            lineReader.on('line', function (line) {
                self.processLine(line);
            });

            lineReader.on('close', function () {
                input.close();
                resolve(self.parserState.doc);
            });

        });
    }

    private readFile1(input: any, state: ParserState): Promise<KnowledgeDoc> {
        let self = this;
        return new Promise<KnowledgeDoc>((resolve, reject) => {
            var remaining = '';

            input.on('data', function (data) {
                remaining += data;
                var index = remaining.indexOf('\n');
                var last = 0;
                while (index > -1) {
                    var line = remaining.substring(last, index);
                    last = index + 1;
                    self.processLine(line);
                    index = remaining.indexOf('\n', last);
                }

                remaining = remaining.substring(last);
            });

            input.on('end', function () {
                if (remaining.length > 0) {
                    self.processLine(remaining);
                }
            });
        });
    }

    private processLine(line: string): void {

        let state = this.parserState;
        state.doc.originalDocument.push(line);

        if (line.startsWith("## ") && state.inSummary) {
            state.inSummary = false;
            state.doc.summary = <SummaryItem>state.currentItem;
        } else if (line.startsWith("## Summary")) {
            state.inSummary = true;
            state.currentItem = new SummaryItem("");
            state.doc.items.push(state.currentItem);
        } else if (state.inSummary && line.trim().length > 0) {
            state.inText = true;

            let summary = <SummaryItem>state.currentItem;
            summary.text = summary.text + ' ' + line;
        } else if (state.inSummary && line.trim() == '' && state.inText) {
            state.inSummary = false;
            state.doc.summary = <SummaryItem>state.currentItem;
        } else {
            if (state.inSummary) {
                let summary = <SummaryItem>state.currentItem;
                summary.text = summary.text + ' ' + line;
            }
        }
    }

};

export class RepoScannerResult {

    constructor() {
        this.folderIndex = [];
        this.fileIndex = [];
        this.docs = [];
    }

    folderIndex: string[];
    fileIndex: string[];
    docs: KnowledgeDoc[];
};

export class RepoScanner {

    private config: IKnowledgeDocConfig;

    public constructor(config: IKnowledgeDocConfig) {
        this.config = config;
    }

    public scan(): Promise<RepoScannerResult> {
        let pathRoot = this.config.repoRoot;
        let self = this;
        let seed = new RepoScannerResult();

        return new Promise<RepoScannerResult>(async (resolve, reject) => {
            let result = self.processFolder(pathRoot, seed);
            result.then(resolve).catch(reject);
        });
    }

    private processFolder(pathRoot: string, result: RepoScannerResult): Promise<RepoScannerResult> {
        let self = this;
        let innerResult = result;
        return new Promise<RepoScannerResult>(async (resolve, reject) => {

            fs.readdir(pathRoot, async (err, files) => {

                if (err) {
                    reject(err);
                    return;
                }

                let asyncOperations = [];
                files.forEach(fileName => {
                    let fullPath = path.join(pathRoot, fileName);
                    let isDirectory = fs.lstatSync(fullPath).isDirectory();

                    if (isDirectory) {
                        result.folderIndex.push(fullPath);
                        if (self.shouldProcessThisFolder(fileName)) {
                            let scanOp = self.processFolder(fullPath, result);
                            asyncOperations.push(scanOp);
                        }
                    } else {
                        if (self.shouldProcessThisFile(fileName)) {
                            result.fileIndex.push(fullPath);
                            if (fileName == "elk_status.md")
                                console.log('here');

                            console.log('processing ' + fullPath);
                            let parser = new KnowledgeDocParser(fullPath);
                            let parseOp = parser.parseDocument().then((doc: KnowledgeDoc) => {
                                doc.name = fileName;
                                doc.path = fullPath;
                                result.docs.push(doc);
                            });

                            asyncOperations.push(parseOp);
                        }
                    }
                });

                Promise.all(asyncOperations).then(() => resolve(result));

            })

        });
    }

    private shouldProcessThisFile(fileName: string) {
        return true;
    }

    private shouldProcessThisFolder(folderName: string): boolean {
        return folderName !== ".git" && folderName !== ".attachments";
    }
};


export class KnowledgeDocumentRepo {

};
