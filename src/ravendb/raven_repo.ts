import DocumentStore, { IDocumentStore } from 'ravendb';
import { IDocument } from '../core/document';
import { IDocumentCriteria } from '../core/document_criteria';


export class RavenRepo {

    static store: IDocumentStore = undefined;

    constructor() {

        if (!RavenRepo.store) {
            RavenRepo.store = DocumentStore.create('<#scrubbed#>', 'test');
            RavenRepo.store.initialize();
        }
    }

    public all(criteria: IDocumentCriteria): Promise<IDocument[]> {

        return new Promise<IDocument[]>(async (resolve, reject) => {
            let session = RavenRepo.store.openSession();
            let query = session.query({

                collection: 'documents', // specify which collection you'd like to query
                // optionally you may specify an index name for querying
                // indexName: 'PopularProductsWithViewsCount'
            });

            let documents = await query.all();
            let results = <IDocument[]>[];
            documents.forEach((sourceDoc) => {
                let doc = <IDocument>{};
                doc.id = sourceDoc.id;
                doc.documentType = "kb";
                doc.documentBody = sourceDoc;
                doc.category = "documents";
                results.push(doc);
            });

            resolve(results);
        });
    }

    public create(document: IDocument): Promise<IDocument> {
        let self = this;
        return new Promise<IDocument>(async (resolve, reject) => {
            let session = RavenRepo.store.openSession();

            let model = document.documentBody;
            model.documentId = document.id;

            document.documentBody = await session.store(model, 'documents/');
            resolve(document);

        });
    }

    public update(document: IDocument): Promise<IDocument> {
        let self = this;
        return new Promise<IDocument>(async (resolve, reject) => {
            let session = RavenRepo.store.openSession();
            let doc = await session.load('documents/' + document.documentBody.id);

            await session.store(doc);
            await session.saveChanges();
            resolve(document);
        });
    }

    public delete(category: string, documentType: string, id: string): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

}