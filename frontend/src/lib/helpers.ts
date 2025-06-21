export function sanitize(text: string) {
    if (!text) {
        return '';
    }

    text = text.replaceAll('"', '&quot;');

    if (text.includes(';')) {
        text = '"' + text + '"';
    }

    return text;
}