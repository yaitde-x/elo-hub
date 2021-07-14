
export class VstsWorkitem {
    "additionalProperties": any;
    "fields": any;
    "id": number;
    "url": string;
};

export class VstsUtilities {
    public static getMyVstsId() : string {
        return "me";
    }

    public static getCompletedWork(item: VstsWorkitem): number {
        if (item.fields && item.fields["Microsoft.VSTS.Scheduling.CompletedWork"])
            return item.fields["Microsoft.VSTS.Scheduling.CompletedWork"];

        return 0;
    }

    public static getOriginalEstimate(item: VstsWorkitem): number {
        if (item.fields && item.fields["Microsoft.VSTS.Scheduling.OriginalEstimate"])
            return item.fields["Microsoft.VSTS.Scheduling.OriginalEstimate"];

        return 0;
    }

    public static getRemainingWork(item: VstsWorkitem): number {
        if (item.fields && item.fields["Microsoft.VSTS.Scheduling.RemainingWork"])
            return item.fields["Microsoft.VSTS.Scheduling.RemainingWork"];

        return 0;
    }

    public static getState(item: VstsWorkitem): string {
        if (item.fields && item.fields["System.State"])
            return item.fields["System.State"];

        return "unknown";
    }

    public static getTitle(item: VstsWorkitem): string {
        if (item.fields && item.fields["System.Title"])
            return item.fields["System.Title"];

        return "unknown";
    }

};
