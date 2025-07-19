export interface IConfiguration<T> {
    get(): Promise<T>;
}