export abstract class IConfiguration<T> {
    abstract get(): Promise<T>;
}