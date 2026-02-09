/**
 * Classe BaseModel astratta per la gestione dei modelli Mongoose.
 *
 * Fornisce:
 * - metodi CRUD generici per documenti singoli e multipli
 * - gestione di operazioni bulk e update by id
 * - gestione di sessioni opzionali tramite Mongoose
 * - metodi tipizzati per TypeScript per facilitare riutilizzo nei modelli concreti
 *
 * Tutti i modelli che estendono BaseModel erediteranno queste funzionalità.
 */

import { Abortable } from "events";
import mongoose, { 
  type AnyBulkWriteOperation, 
  CreateOptions, 
  DeleteResult, 
  Document, 
  Model, 
  type MongooseBaseQueryOptions, 
  MongooseBulkWriteOptions, 
  MongooseBulkWriteResult, 
  MongooseUpdateQueryOptions, 
  ProjectionType, 
  QueryOptions, 
  RootFilterQuery, 
  UpdateQuery, 
  UpdateWithAggregationPipeline, 
  UpdateWriteOpResult 
} from "mongoose";

// Tipi per opzioni di delete e update
type DeleteOptions = mongoose.mongo.DeleteOptions;
type UpdateOptions = mongoose.mongo.UpdateOptions;

// Tipizzazioni generiche per TypeScript per riutilizzare i metodi nei modelli concreti
export type CreateArgsProps<T extends Document> = Parameters<BaseModel<T>["create"]>;
export type GetManyArgsProps<T extends Document> = Parameters<BaseModel<T>["getMany"]>;
export type UpdateByIdArgsProps<T extends Document> = Parameters<BaseModel<T>["updateById"]>;
export type UpdateManyByIdArgsProps<T extends Document> = Parameters<BaseModel<T>["updateManyById"]>;
export type DeleteByIdArgsProps<T extends Document> = Parameters<BaseModel<T>["deleteById"]>;
export type DeleteManyByIdArgsProps<T extends Document> = Parameters<BaseModel<T>["deleteManyById"]>;
export type DeleteManyArgsProps<T extends Document> = Parameters<BaseModel<T>["deleteMany"]>;
export type AggregateArgsProps<T extends Document> = Parameters<BaseModel<T>["aggregate"]>;

/**
 * BaseModel astratto
 * @template T Documento Mongoose
 * @template TLean Tipo lean del documento (opzionale)
 */
abstract class BaseModel<T extends Document, TLean = Omit<T, keyof Document>> {
  private static instances = new Map<Function, any>();

  constructor(protected model: Model<T>) {}

  /**
   * Pattern singleton per istanze dei modelli
   */
  static getInstance<T1 extends BaseModel<any>>(
    this: new (...args: any[]) => T1,
    ...args: ConstructorParameters<new (...args: any[]) => T1>
  ): T1 {
    if (!BaseModel.instances.has(this)) {
      BaseModel.instances.set(this, new this(...args));
    }
    return BaseModel.instances.get(this);
  }

  /** Crea nuovi documenti */
  async create(newDocuments: Partial<TLean>[], options?: CreateOptions & { aggregateErrors?: boolean; }): Promise<T[]> {
    if(newDocuments.length <= 0) return []; 
    return await this.model.create(newDocuments, options);
  }

  /** Aggiorna un documento per ID */
  async updateById(id: string, update?: UpdateQuery<T>, options?: QueryOptions<T> | null): Promise<T> {
    return await this.model.findByIdAndUpdate(id, update, {new: true, runValidators: true, ...options}).orFail();
  }

  /** Aggiorna più documenti per array di ID */
  async updateManyById(
    ids: string[], 
    update: UpdateQuery<T> | UpdateWithAggregationPipeline, 
    options?: (UpdateOptions & MongooseUpdateQueryOptions<T>) | null
  ): Promise<UpdateWriteOpResult> {
    const result = await this.model.updateMany({_id: {$in: ids}}, update, options);
    if(result.modifiedCount < ids.length) {
      const missigCount = ids.length - result.modifiedCount;
      throw new Error(`No document found for ${missigCount} ids on model ${this.model.modelName}`);
    }
    return result;
  }

  /** Aggiorna un singolo documento tramite filtro */
  async updateOne(
    filter: mongoose.RootFilterQuery<T>, 
    update: UpdateQuery<T>, 
    options?: QueryOptions<T> & { includeResultMetadata?: boolean; lean?: boolean; }
  ): Promise<T> {
    return await this.model.findOneAndUpdate(filter, update, {new: true, runValidators: true, ...options}).orFail();
  }

  /** Aggiorna più documenti tramite filtro */
  async updateMany(
    filter: RootFilterQuery<T>, 
    update: UpdateQuery<T> | UpdateWithAggregationPipeline, 
    options?: (UpdateOptions & MongooseUpdateQueryOptions<T>) | null
  ): Promise<UpdateWriteOpResult> {
    return await this.model.updateMany(filter, update, options);
  }

  /** Aggiornamento bulk per array di id + dati */
  async bulkWriteById(writes: {id: string, data: Partial<T>}[], options?: MongooseBulkWriteOptions & { ordered?: boolean; }): Promise<T[]> {
    await this.model.bulkWrite(
      writes.map(e => ({
        updateOne: {
          filter: { _id: e.id },
          update: { $set: e.data }
        },
      })), 
      options
    );
    return await this.getManyById(writes.map((e) => e.id));
  }

  /** Operazioni bulk generiche */
  async bulkWrite(writes: AnyBulkWriteOperation<T>[], options?: MongooseBulkWriteOptions & { ordered?: boolean; }): Promise<MongooseBulkWriteResult> {
    return await this.model.bulkWrite(writes, options);
  }

  /** Recupera tutti i documenti */
  async getAll(): Promise<T[]> {
    return await this.model.find({}, null, {sort: {createdAt: -1}});
  }

  /** Recupera documento per ID */
  async getById(id:string, projection?: ProjectionType<T> | null, options?: QueryOptions<T> & { lean?: boolean; }): Promise<T> {
    return await this.model.findById(id, projection, options).orFail();
  }

  /** Recupera più documenti tramite array di ID e verifica che esistano tutti */
  async getManyById(ids: string[], projection?: ProjectionType<T>|null, options?: QueryOptions<T> & { lean?: boolean; } & Abortable): Promise<T[]> {
    const documents = await this.model.find({_id: {$in: ids}}, projection, options);
    if(documents.length < ids.length) {
      const missingIds = ids.filter((e) => !documents.find((d) => d.id === e));
      throw new Error(`No document found for ids [${missingIds}] on model ${this.model.modelName}`);
    }
    return documents;
  }

  /** Recupera un singolo documento tramite filtro */
  async getOne(filter?: RootFilterQuery<T>, projection?: ProjectionType<T>|null, options?: (QueryOptions<T> & Abortable) | null): Promise<T> {
    return await this.model.findOne(filter, projection, options).orFail();
  }

  /** Recupera più documenti tramite filtro */
  async getMany(filter: RootFilterQuery<T>, projection?: ProjectionType<T>|null, options?: QueryOptions<T> & { lean?: boolean; } & Abortable): Promise<T[]> {
    return await this.model.find(filter, projection, {sort: {createdAt: -1}, ...options});
  }

  /** Cancella documento per ID */
  async deleteById(id: string, options?: QueryOptions<T> & { lean?: boolean; }): Promise<T> {
    return await this.model.findByIdAndDelete(id, options).orFail();
  }

  /** Cancella più documenti tramite array di ID e verifica che siano tutti cancellati */
  async deleteManyById(ids: string[], options?: (DeleteOptions & MongooseBaseQueryOptions<T>) | null): Promise<DeleteResult> {
    const result = await this.model.deleteMany({_id: {$in: ids}}, options);
    if(result.deletedCount < ids.length) {
      const missigCount = ids.length - result.deletedCount;
      throw new Error(`No document found for ${missigCount} ids on model ${this.model.modelName}`);
    }
    return result;
  }

  /** Cancella un singolo documento tramite filtro */
  async deleteOne(filter: RootFilterQuery<T> | null, options?: QueryOptions<T> | null): Promise<T> {
    return await this.model.findOneAndDelete(filter, options).orFail();
  }

  /** Cancella più documenti tramite filtro */
  async deleteMany(filter: RootFilterQuery<T>, options?: (DeleteOptions & MongooseBaseQueryOptions<T>) | null): Promise<DeleteResult> { 
    return await this.model.deleteMany(filter, options);
  }

  /** Aggregazioni avanzate tramite pipeline */
  async aggregate(pipeline: mongoose.PipelineStage[], options?: mongoose.AggregateOptions): Promise<T[]> {
    return await this.model.aggregate(pipeline, options);
  }
}

export default BaseModel;