export class JanusError {
    code;
    reason;
    constructor(code, reason) {
        this.code = code;
        this.reason = reason;
    }
}
