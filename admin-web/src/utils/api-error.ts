export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
    const maybeError = error as {
        response?: {
            data?: {
                message?: string | string[];
            };
        };
        message?: string;
    };

    const message = maybeError?.response?.data?.message;
    if (Array.isArray(message) && message.length > 0) {
        return message.join(' ');
    }

    if (typeof message === 'string' && message.trim().length > 0) {
        return message;
    }

    if (typeof maybeError?.message === 'string' && maybeError.message.trim().length > 0) {
        return maybeError.message;
    }

    return fallbackMessage;
}
