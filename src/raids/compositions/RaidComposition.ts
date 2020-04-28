
/**
 * A specification of roles to be used in creating a raid event.
 */
export interface IRaidComposition {
    name: string;
    roles: Array<{
        name: string;
        reqParticipants: number;
    }>;
}
