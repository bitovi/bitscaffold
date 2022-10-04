import signale from "signale";

export function info() {
    signale.info(...arguments);
}

export function pending() {
    signale.pending(...arguments);
}

export function success() {
    signale.success(...arguments);
}