
export class Message{

    private errorCode:string;
    private statusMessage:string|null;
    private localStatusMessage:string|null;
    private sandip_sir_ask:string| null;

    public getErrorCode(): string {
        return this.errorCode;
    }

    public setErrorCode(errorCode: string): void {
        this.errorCode = errorCode;
    }

    public getStatusMessage(): string|null {
        return this.statusMessage;
    }

    public setStatusMessage(statusMessage: string|null): void {
        this.statusMessage = statusMessage;
    }

    public getLocalStatusMessage(): string|null {
        return this.localStatusMessage;
    }

    public setLocalStatusMessage(localStatusMessage: string): void {
        this.localStatusMessage = localStatusMessage;
    }

    // public getSandip_sir_ask(): null {
    //     return this.sandip_sir_ask;
    // }

    public setSandip_sir_ask(sandip_sir_ask: null): void {
        this.sandip_sir_ask = sandip_sir_ask;
    }


    constructor(errorcode:string,statusmessage:string|null,localstatusmessage:string|null,sansip_sir_ask:string| null){
        this.errorCode = errorcode;
        this.localStatusMessage = localstatusmessage;
        this.statusMessage = statusmessage;
        this.sandip_sir_ask = sansip_sir_ask;
    }

}
