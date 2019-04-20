export class DateHelper {
    public static get currentDate() : string {
        return new Date().toLocaleDateString("pt-BR");
    }

    public static get currentTimestamp() : number {
        return new Date().getTime();
    }
}
