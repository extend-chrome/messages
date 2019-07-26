'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const send = (message, target) => new Promise((resolve, reject) => {
    const coreMessage = {
        async: false,
        target: target || null,
        payload: message,
    };
    const callback = (response) => {
        if (chrome.runtime.lastError) {
            const lastError = chrome.runtime.lastError.message;
            const noResponse = 'The message port closed before a response was received';
            if (lastError && lastError.includes(noResponse)) {
                resolve();
            }
            else {
                reject({ message: lastError });
            }
        }
        else {
            if (response && !response.success) {
                reject(response.payload);
            }
            else {
                resolve();
            }
        }
    };
    if (typeof target === 'number') {
        chrome.tabs.sendMessage(target, coreMessage, callback);
    }
    else {
        chrome.runtime.sendMessage(coreMessage, callback);
    }
});
const asyncSend = (message, target) => new Promise((resolve, reject) => {
    const coreMessage = {
        async: true,
        target: target || null,
        payload: message,
    };
    const callback = (coreResponse) => {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
        }
        else if (coreResponse.success === false) {
            reject(new Error(coreResponse.payload.greeting));
        }
        else {
            resolve(coreResponse.payload);
        }
    };
    if (typeof target === 'number') {
        chrome.tabs.sendMessage(target, coreMessage, callback);
    }
    else {
        chrome.runtime.sendMessage(coreMessage, callback);
    }
});

const _listeners = new Map();
const on = (listener, target) => {
    const _listener = (message, sender) => {
        if (message.async) {
            return false;
        }
        if (typeof message.target === 'number' || // is content script
            !message.target || // general message
            message.target === target // is correct target
        ) {
            try {
                listener(message.payload, sender);
            }
            catch (error) {
                // Log listener error
                console.error('Uncaught error in chrome.runtime.onMessage listener');
                console.error(error);
            }
        }
        return false;
    };
    chrome.runtime.onMessage.addListener(_listener);
    _listeners.set(listener, _listener);
};
const asyncOn = (listener, target) => {
    const _listener = ({ async, payload, target: _target }, sender, sendResponse) => {
        if (async &&
            (typeof _target === 'number' ||
                !_target ||
                _target === target)) {
            (async () => {
                try {
                    const respond = (response) => {
                        const coreResponse = {
                            success: true,
                            payload: response,
                        };
                        sendResponse(coreResponse);
                    };
                    await listener(payload, sender, respond);
                }
                catch (error) {
                    const response = {
                        success: false,
                        payload: {
                            greeting: error.message,
                        },
                    };
                    console.error(error);
                    sendResponse(response);
                }
            })();
            return true;
        }
        return false;
    };
    chrome.runtime.onMessage.addListener(_listener);
    _listeners.set(listener, _listener);
};
const off = (listener) => {
    const _listener = _listeners.get(listener);
    if (_listener) {
        _listeners.delete(listener);
        chrome.runtime.onMessage.removeListener(_listener);
    }
};

const onMessage = {
    addListener: (listener, { target, async } = {}) => {
        const _event = async ? asyncOn : on;
        target ? _event(listener, target) : _event(listener);
    },
    removeListener: off,
    hasListeners: () => _listeners.size > 0,
    hasListener: _listeners.has,
};
const sendMessage = (message, { target, async } = {}) => {
    const _send = async ? asyncSend : send;
    return _send(message, target);
};
const messages = {
    asyncOn,
    asyncSend,
    off,
    on,
    send,
};

exports.messages = messages;
exports.onMessage = onMessage;
exports.sendMessage = sendMessage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVtYmxlLW1lc3NhZ2VzLWNqcy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3NlbmQudHMiLCIuLi9zcmMvZXZlbnRzLnRzIiwiLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBzZW5kID0gKFxuICBtZXNzYWdlOiBhbnksXG4gIHRhcmdldD86IHN0cmluZyB8IG51bWJlcixcbik6IFByb21pc2U8dm9pZD4gPT5cbiAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGNvcmVNZXNzYWdlOiBDb3JlTWVzc2FnZSA9IHtcbiAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgIHRhcmdldDogdGFyZ2V0IHx8IG51bGwsXG4gICAgICBwYXlsb2FkOiBtZXNzYWdlLFxuICAgIH1cblxuICAgIGNvbnN0IGNhbGxiYWNrID0gKHJlc3BvbnNlOiBDb3JlUmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgY29uc3QgbGFzdEVycm9yID0gY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2VcbiAgICAgICAgY29uc3Qgbm9SZXNwb25zZSA9XG4gICAgICAgICAgJ1RoZSBtZXNzYWdlIHBvcnQgY2xvc2VkIGJlZm9yZSBhIHJlc3BvbnNlIHdhcyByZWNlaXZlZCdcblxuICAgICAgICBpZiAobGFzdEVycm9yICYmIGxhc3RFcnJvci5pbmNsdWRlcyhub1Jlc3BvbnNlKSkge1xuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdCh7IG1lc3NhZ2U6IGxhc3RFcnJvciB9KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZWplY3QocmVzcG9uc2UucGF5bG9hZClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnbnVtYmVyJykge1xuICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFyZ2V0LCBjb3JlTWVzc2FnZSwgY2FsbGJhY2spXG4gICAgfSBlbHNlIHtcbiAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKGNvcmVNZXNzYWdlLCBjYWxsYmFjaylcbiAgICB9XG4gIH0pXG5cbmV4cG9ydCBjb25zdCBhc3luY1NlbmQgPSAoXG4gIG1lc3NhZ2U6IGFueSxcbiAgdGFyZ2V0Pzogc3RyaW5nIHwgbnVtYmVyLFxuKTogUHJvbWlzZTxhbnk+ID0+XG4gIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBjb3JlTWVzc2FnZTogQ29yZU1lc3NhZ2UgPSB7XG4gICAgICBhc3luYzogdHJ1ZSxcbiAgICAgIHRhcmdldDogdGFyZ2V0IHx8IG51bGwsXG4gICAgICBwYXlsb2FkOiBtZXNzYWdlLFxuICAgIH1cblxuICAgIGNvbnN0IGNhbGxiYWNrID0gKGNvcmVSZXNwb25zZTogQ29yZVJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgIHJlamVjdChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpXG4gICAgICB9IGVsc2UgaWYgKGNvcmVSZXNwb25zZS5zdWNjZXNzID09PSBmYWxzZSkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGNvcmVSZXNwb25zZS5wYXlsb2FkLmdyZWV0aW5nKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoY29yZVJlc3BvbnNlLnBheWxvYWQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdudW1iZXInKSB7XG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YXJnZXQsIGNvcmVNZXNzYWdlLCBjYWxsYmFjaylcbiAgICB9IGVsc2Uge1xuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoY29yZU1lc3NhZ2UsIGNhbGxiYWNrKVxuICAgIH1cbiAgfSlcbiIsImV4cG9ydCBjb25zdCBfbGlzdGVuZXJzOiBNYXA8XG4gIE1lc3NhZ2VMaXN0ZW5lciB8IEFzeW5jTWVzc2FnZUxpc3RlbmVyLFxuICBDb3JlTGlzdGVuZXJcbj4gPSBuZXcgTWFwKClcblxuZXhwb3J0IGNvbnN0IG9uID0gKFxuICBsaXN0ZW5lcjogTWVzc2FnZUxpc3RlbmVyLFxuICB0YXJnZXQ/OiBUYXJnZXROYW1lLFxuKSA9PiB7XG4gIGNvbnN0IF9saXN0ZW5lcjogQ29yZUxpc3RlbmVyID0gKG1lc3NhZ2UsIHNlbmRlcikgPT4ge1xuICAgIGlmIChtZXNzYWdlLmFzeW5jKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0eXBlb2YgbWVzc2FnZS50YXJnZXQgPT09ICdudW1iZXInIHx8IC8vIGlzIGNvbnRlbnQgc2NyaXB0XG4gICAgICAhbWVzc2FnZS50YXJnZXQgfHwgLy8gZ2VuZXJhbCBtZXNzYWdlXG4gICAgICBtZXNzYWdlLnRhcmdldCA9PT0gdGFyZ2V0IC8vIGlzIGNvcnJlY3QgdGFyZ2V0XG4gICAgKSB7XG4gICAgICB0cnkge1xuICAgICAgICBsaXN0ZW5lcihtZXNzYWdlLnBheWxvYWQsIHNlbmRlcilcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIExvZyBsaXN0ZW5lciBlcnJvclxuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICdVbmNhdWdodCBlcnJvciBpbiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UgbGlzdGVuZXInLFxuICAgICAgICApXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoX2xpc3RlbmVyKVxuICBfbGlzdGVuZXJzLnNldChsaXN0ZW5lciwgX2xpc3RlbmVyKVxufVxuXG5leHBvcnQgY29uc3QgYXN5bmNPbiA9IChcbiAgbGlzdGVuZXI6IEFzeW5jTWVzc2FnZUxpc3RlbmVyLFxuICB0YXJnZXQ/OiBUYXJnZXROYW1lLFxuKSA9PiB7XG4gIGNvbnN0IF9saXN0ZW5lcjogQ29yZUxpc3RlbmVyID0gKFxuICAgIHsgYXN5bmMsIHBheWxvYWQsIHRhcmdldDogX3RhcmdldCB9LFxuICAgIHNlbmRlcixcbiAgICBzZW5kUmVzcG9uc2UsXG4gICkgPT4ge1xuICAgIGlmIChcbiAgICAgIGFzeW5jICYmXG4gICAgICAodHlwZW9mIF90YXJnZXQgPT09ICdudW1iZXInIHx8XG4gICAgICAgICFfdGFyZ2V0IHx8XG4gICAgICAgIF90YXJnZXQgPT09IHRhcmdldClcbiAgICApIHtcbiAgICAgIDsoYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3BvbmQgPSAocmVzcG9uc2U6IE1lc3NhZ2VQYXlsb2FkKTogdm9pZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb3JlUmVzcG9uc2U6IENvcmVSZXNwb25zZSA9IHtcbiAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgcGF5bG9hZDogcmVzcG9uc2UsXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbmRSZXNwb25zZShjb3JlUmVzcG9uc2UpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYXdhaXQgbGlzdGVuZXIocGF5bG9hZCwgc2VuZGVyLCByZXNwb25kKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlOiBDb3JlUmVzcG9uc2UgPSB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgZ3JlZXRpbmc6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHJlc3BvbnNlKVxuICAgICAgICB9XG4gICAgICB9KSgpXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoX2xpc3RlbmVyKVxuICBfbGlzdGVuZXJzLnNldChsaXN0ZW5lciwgX2xpc3RlbmVyKVxufVxuXG5leHBvcnQgY29uc3Qgb2ZmID0gKGxpc3RlbmVyOiBNZXNzYWdlTGlzdGVuZXIpID0+IHtcbiAgY29uc3QgX2xpc3RlbmVyID0gX2xpc3RlbmVycy5nZXQobGlzdGVuZXIpXG5cbiAgaWYgKF9saXN0ZW5lcikge1xuICAgIF9saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKVxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5yZW1vdmVMaXN0ZW5lcihfbGlzdGVuZXIpXG4gIH1cbn1cbiIsImltcG9ydCB7IHNlbmQsIGFzeW5jU2VuZCB9IGZyb20gJy4vc2VuZCdcbmltcG9ydCB7IG9uLCBhc3luY09uLCBvZmYsIF9saXN0ZW5lcnMgfSBmcm9tICcuL2V2ZW50cydcblxuZXhwb3J0IGNvbnN0IG9uTWVzc2FnZSA9IHtcbiAgYWRkTGlzdGVuZXI6IChcbiAgICBsaXN0ZW5lcjogKFxuICAgICAgbWVzc2FnZToge1xuICAgICAgICBncmVldGluZzogc3RyaW5nXG4gICAgICAgIFtwcm9wOiBzdHJpbmddOiBhbnlcbiAgICAgIH0sXG4gICAgICBzZW5kZXI6IGNocm9tZS5ydW50aW1lLk1lc3NhZ2VTZW5kZXIsXG4gICAgICAvLyBXM0MgaGFzIGRlcHJlY2F0ZWQgc2VuZFJlc3BvbnNlIGluIGZhdm9yIG9mIGEgcHJvbWlzZVxuICAgICAgc2VuZFJlc3BvbnNlPzogKHJlc3BvbnNlPzogYW55KSA9PiB2b2lkLFxuICAgICkgPT4gdm9pZCxcbiAgICB7IHRhcmdldCwgYXN5bmMgfTogeyB0YXJnZXQ/OiBzdHJpbmc7IGFzeW5jPzogYm9vbGVhbiB9ID0ge30sXG4gICkgPT4ge1xuICAgIGNvbnN0IF9ldmVudCA9IGFzeW5jID8gYXN5bmNPbiA6IG9uXG5cbiAgICB0YXJnZXQgPyBfZXZlbnQobGlzdGVuZXIsIHRhcmdldCkgOiBfZXZlbnQobGlzdGVuZXIpXG4gIH0sXG4gIHJlbW92ZUxpc3RlbmVyOiBvZmYsXG4gIGhhc0xpc3RlbmVyczogKCkgPT4gX2xpc3RlbmVycy5zaXplID4gMCxcbiAgaGFzTGlzdGVuZXI6IF9saXN0ZW5lcnMuaGFzLFxufVxuXG5leHBvcnQgY29uc3Qgc2VuZE1lc3NhZ2UgPSAoXG4gIG1lc3NhZ2U6IHtcbiAgICBncmVldGluZzogc3RyaW5nXG4gICAgW3Byb3A6IHN0cmluZ106IGFueVxuICB9LFxuICB7IHRhcmdldCwgYXN5bmMgfTogeyB0YXJnZXQ/OiBzdHJpbmc7IGFzeW5jPzogYm9vbGVhbiB9ID0ge30sXG4pID0+IHtcbiAgY29uc3QgX3NlbmQgPSBhc3luYyA/IGFzeW5jU2VuZCA6IHNlbmRcblxuICByZXR1cm4gX3NlbmQobWVzc2FnZSwgdGFyZ2V0KVxufVxuXG5leHBvcnQgY29uc3QgbWVzc2FnZXMgPSB7XG4gIGFzeW5jT24sXG4gIGFzeW5jU2VuZCxcbiAgb2ZmLFxuICBvbixcbiAgc2VuZCxcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQU8sTUFBTSxJQUFJLEdBQUcsQ0FDbEIsT0FBWSxFQUNaLE1BQXdCLEtBRXhCLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU07SUFDMUIsTUFBTSxXQUFXLEdBQWdCO1FBQy9CLEtBQUssRUFBRSxLQUFLO1FBQ1osTUFBTSxFQUFFLE1BQU0sSUFBSSxJQUFJO1FBQ3RCLE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUE7SUFFRCxNQUFNLFFBQVEsR0FBRyxDQUFDLFFBQXNCO1FBQ3RDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDNUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFBO1lBQ2xELE1BQU0sVUFBVSxHQUNkLHdEQUF3RCxDQUFBO1lBRTFELElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQy9DLE9BQU8sRUFBRSxDQUFBO2FBQ1Y7aUJBQU07Z0JBQ0wsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7YUFDL0I7U0FDRjthQUFNO1lBQ0wsSUFBSSxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO2dCQUNqQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFBO2FBQ3pCO2lCQUFNO2dCQUNMLE9BQU8sRUFBRSxDQUFBO2FBQ1Y7U0FDRjtLQUNGLENBQUE7SUFFRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtRQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZEO1NBQU07UUFDTCxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDbEQ7Q0FDRixDQUFDLENBQUE7QUFFSixBQUFPLE1BQU0sU0FBUyxHQUFHLENBQ3ZCLE9BQVksRUFDWixNQUF3QixLQUV4QixJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO0lBQzFCLE1BQU0sV0FBVyxHQUFnQjtRQUMvQixLQUFLLEVBQUUsSUFBSTtRQUNYLE1BQU0sRUFBRSxNQUFNLElBQUksSUFBSTtRQUN0QixPQUFPLEVBQUUsT0FBTztLQUNqQixDQUFBO0lBRUQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxZQUEwQjtRQUMxQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO1lBQzVCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1NBQ2pDO2FBQU0sSUFBSSxZQUFZLENBQUMsT0FBTyxLQUFLLEtBQUssRUFBRTtZQUN6QyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO1NBQ2pEO2FBQU07WUFDTCxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1NBQzlCO0tBQ0YsQ0FBQTtJQUVELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1FBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDdkQ7U0FBTTtRQUNMLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNsRDtDQUNGLENBQUMsQ0FBQTs7QUNoRUcsTUFBTSxVQUFVLEdBR25CLElBQUksR0FBRyxFQUFFLENBQUE7QUFFYixBQUFPLE1BQU0sRUFBRSxHQUFHLENBQ2hCLFFBQXlCLEVBQ3pCLE1BQW1CO0lBRW5CLE1BQU0sU0FBUyxHQUFpQixDQUFDLE9BQU8sRUFBRSxNQUFNO1FBQzlDLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtZQUNqQixPQUFPLEtBQUssQ0FBQTtTQUNiO1FBRUQsSUFDRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLEtBQUssUUFBUTtZQUNsQyxDQUFDLE9BQU8sQ0FBQyxNQUFNO1lBQ2YsT0FBTyxDQUFDLE1BQU0sS0FBSyxNQUFNO1VBQ3pCO1lBQ0EsSUFBSTtnQkFDRixRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTthQUNsQztZQUFDLE9BQU8sS0FBSyxFQUFFOztnQkFFZCxPQUFPLENBQUMsS0FBSyxDQUNYLHFEQUFxRCxDQUN0RCxDQUFBO2dCQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDckI7U0FDRjtRQUVELE9BQU8sS0FBSyxDQUFBO0tBQ2IsQ0FBQTtJQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUMvQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQTtDQUNwQyxDQUFBO0FBRUQsQUFBTyxNQUFNLE9BQU8sR0FBRyxDQUNyQixRQUE4QixFQUM5QixNQUFtQjtJQUVuQixNQUFNLFNBQVMsR0FBaUIsQ0FDOUIsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFDbkMsTUFBTSxFQUNOLFlBQVk7UUFFWixJQUNFLEtBQUs7YUFDSixPQUFPLE9BQU8sS0FBSyxRQUFRO2dCQUMxQixDQUFDLE9BQU87Z0JBQ1IsT0FBTyxLQUFLLE1BQU0sQ0FBQyxFQUNyQjtZQUNDLENBQUM7Z0JBQ0EsSUFBSTtvQkFDRixNQUFNLE9BQU8sR0FBRyxDQUFDLFFBQXdCO3dCQUN2QyxNQUFNLFlBQVksR0FBaUI7NEJBQ2pDLE9BQU8sRUFBRSxJQUFJOzRCQUNiLE9BQU8sRUFBRSxRQUFRO3lCQUNsQixDQUFBO3dCQUVELFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQTtxQkFDM0IsQ0FBQTtvQkFFRCxNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO2lCQUN6QztnQkFBQyxPQUFPLEtBQUssRUFBRTtvQkFDZCxNQUFNLFFBQVEsR0FBaUI7d0JBQzdCLE9BQU8sRUFBRSxLQUFLO3dCQUNkLE9BQU8sRUFBRTs0QkFDUCxRQUFRLEVBQUUsS0FBSyxDQUFDLE9BQU87eUJBQ3hCO3FCQUNGLENBQUE7b0JBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtvQkFDcEIsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBO2lCQUN2QjthQUNGLEdBQUcsQ0FBQTtZQUVKLE9BQU8sSUFBSSxDQUFBO1NBQ1o7UUFFRCxPQUFPLEtBQUssQ0FBQTtLQUNiLENBQUE7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDL0MsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUE7Q0FDcEMsQ0FBQTtBQUVELEFBQU8sTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUF5QjtJQUMzQyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBRTFDLElBQUksU0FBUyxFQUFFO1FBQ2IsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUMzQixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDbkQ7Q0FDRixDQUFBOztNQzNGWSxTQUFTLEdBQUc7SUFDdkIsV0FBVyxFQUFFLENBQ1gsUUFRUyxFQUNULEVBQUUsTUFBTSxFQUFFLEtBQUssS0FBMkMsRUFBRTtRQUU1RCxNQUFNLE1BQU0sR0FBRyxLQUFLLEdBQUcsT0FBTyxHQUFHLEVBQUUsQ0FBQTtRQUVuQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDckQ7SUFDRCxjQUFjLEVBQUUsR0FBRztJQUNuQixZQUFZLEVBQUUsTUFBTSxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUM7SUFDdkMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHO0NBQzVCLENBQUE7QUFFRCxNQUFhLFdBQVcsR0FBRyxDQUN6QixPQUdDLEVBQ0QsRUFBRSxNQUFNLEVBQUUsS0FBSyxLQUEyQyxFQUFFO0lBRTVELE1BQU0sS0FBSyxHQUFHLEtBQUssR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBRXRDLE9BQU8sS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtDQUM5QixDQUFBO0FBRUQsTUFBYSxRQUFRLEdBQUc7SUFDdEIsT0FBTztJQUNQLFNBQVM7SUFDVCxHQUFHO0lBQ0gsRUFBRTtJQUNGLElBQUk7Q0FDTDs7Ozs7OyJ9
