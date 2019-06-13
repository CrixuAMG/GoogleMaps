class MapsElementDoesNotExistError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MapsElementDoesNotExistError';
    }
}
