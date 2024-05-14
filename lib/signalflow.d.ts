export interface SignalFlowClientOptions {
    signalflowEndpoint: string;
    webSocketErrorCallback?: (error: any) => void;
}

export interface ExecuteOptions {
    program: string;
    start?: number;
    stop?: number;
    resolution?: number;
    offsetByMaxDelay?: boolean;
    maxDelay?: number;
    immediate?: boolean;
    usedByDetectorUI?: boolean;
    useCache?: boolean;
    compress?: boolean;
}

type SignalFlow = (token: string, options: SignalFlowClientOptions) => SignalFlowClient;

export const SignalFlow: SignalFlow;
export type Streamer = {
    SignalFlow: SignalFlow;
};

export const streamer: Streamer;

type StreamControlMessageBase = {
    type: 'control-message';
    channel: string;
    timestampMs: number;
};

export type StreamControlMessageStreamStart = StreamControlMessageBase & {
    event: 'STREAM_START';
    traceId: string;
};

export type StreamControlMessageEndOfChannel = StreamControlMessageBase & {
    event: 'END_OF_CHANNEL';
};

export type StreamControlMessageKeepAlive = StreamControlMessageBase & {
    event: 'KEEP_ALIVE';
};

export type StreamControlMessageJobStart = StreamControlMessageBase & {
    event: 'JOB_START';
    handle: string;
};

export type StreamControlMessageJobProgress = StreamControlMessageBase & {
    event: 'JOB_PROGRESS';
    progress: number;
};

export type StreamControlMessageChannelAbort = StreamControlMessageBase & {
    event: 'CHANNEL_ABORT';
    abortInfo: Record<string, unknown>;
};

export type StreamControlMessageChannelAttach = StreamControlMessageBase & {
    event: 'ATTACH';
    channelsAttached: unknown;
};

export type StreamControlMessageChannelDetach = StreamControlMessageBase & {
    event: 'DETACH';
    channelsDetached: unknown;
};

/**
 * Provide information about the stream itself
 */
export type StreamControlMessage = {
    type: 'control-message';
    channel: string;
    timestampMs: number;
} & (
    | StreamControlMessageStreamStart
    | StreamControlMessageEndOfChannel
    | StreamControlMessageKeepAlive
    | StreamControlMessageJobStart
    | StreamControlMessageJobProgress
    | StreamControlMessageChannelAbort
    | StreamControlMessageChannelAttach
    | StreamControlMessageChannelDetach
);

/**
 * Metadata messages contain the metadata from the output time series of your computation.
 */
export type StreamMetadataMessage = {
    type: 'metadata';
    channel: string;
    tsId: string;
    properties: {
        jobId: string;
        sf_organizationID: string;
        sf_streamLabel?: string;
        sf_key: string[];
        sf_metric: string;
        sf_originatingMetric: string;
        sf_resolutionMs: number;
        sf_type: string;
        sf_isPreQuantized: boolean;
        sf_tags?: string[];
    } & Record<string, string>;
};

/**
 * Expired TSID messages indicate that a specific output timeseries is probably no longer useful for the computation.
 */
export type StreamExpiredTSIDMessage = {
    type: 'expired-tsid';
    channel: string;
    tsId: string;
};

export type StreamDataPoint = {
    tsId: string;
    value: number;
};

/**
 * Data messages contain the actual timeseries results generated by the computation.
 */
export type StreamDataMessage = {
    type: 'data';
    channel: string;
    data: StreamDataPoint[];
    logicalTimestampMs: number;
    maxDelayMs?: number;
};

export type EventState = 'ok' | 'anomalous' | 'manually_resolved' | 'stopped';

/**
 * Sent when an anomaly triggers a SignalFx detector, or when the triggered detector resolves
 */
export type StreamEventMessage = {
    type: 'event';
    channel: string;
    properties: {
        incidentId: string;
        inputValues: string;
        is: EventState;
        was: EventState;
    };
    timestampMs: number;
    tsId: string;
};

export declare type LiveTailMetadata = {
    eventsMatched: number;
    eventsSent: number;
};

export type LiveTailResult = {
    id: string;
    _raw: string;
    _time: string;
    [key: string]: string | number;
};

export type StreamLogDataMessage = {
    type: 'log-data';
    results: LiveTailResult[];
    metadata: LiveTailMetadata;
};

export type StreamLiveTailStartedMessage = {
    type: 'livetail-started';
    channel: string;
    timestampMs: number;
};

export type StreamMessageMessage = {
    type: 'message';
    channel: string;
    logicalTimestampMs: number;
    message: {
        messageCode: string;
        messageLevel: string;
        numInputTimeSeries: number;
        timestampMs: number;
        blockContexts: Array<{ column: number; line: number }>;
    };
};

export type StreamAuthenticatedMessage = {
    type: 'authenticated';
    channel: string;
    userId: string;
    orgId: string;
};

export type StreamComputationStartedMessage = {
    type: 'computation-started';
    channel: string;
    computationId: string;
};

export type StreamEstimationMessage = {
    type: 'estimation';
    channel: string;
    result: unknown;
};

/**
 * Union of all stream messages.
 */
export type StreamMessage =
    | StreamControlMessage
    | StreamMetadataMessage
    | StreamExpiredTSIDMessage
    | StreamDataMessage
    | StreamEventMessage
    | StreamLogDataMessage
    | StreamLiveTailStartedMessage
    | StreamMessageMessage
    | StreamAuthenticatedMessage
    | StreamComputationStartedMessage
    | StreamEstimationMessage;

export type StreamError = {
    type: 'error';
    channel: string;
    context: any;
    error: number;
    errorType: 'ANALYTICS_PROGRAM_NAME_ERROR';
    message: string | null;
    errors?: { code: string }[];
};

export type StreamCallback = (error: StreamError | undefined, message: StreamMessage | undefined) => void;

export interface LiveTailOptions {
    query: object;
    throttleOptions: object;
}
export interface SignalFlowClient {
    execute(opts: ExecuteOptions): Stream;
    disconnect(): void;
    livetail(opts: LiveTailOptions): LiveTail | undefined;
    initialized?: boolean;
}

export interface Stream {
    stream(fn: StreamCallback): boolean;
    close(): boolean;

    // eslint-disable-next-line @typescript-eslint/camelcase
    get_known_tsids(): string[];
    // eslint-disable-next-line @typescript-eslint/camelcase
    get_metadata(tsId: string): StreamMetadataMessage;
}

export interface LiveTail {
    stream(fn: StreamCallback): boolean;
    close(): boolean;
}

export const CONSTANTS: {
    MESSAGE_TYPES: {
        METADATA: 'metadata',
        DATA: 'data',
        EVENT: 'event',
        CONTROL: 'control-message'
    };
};
