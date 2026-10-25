export function formDataToObject(formData: FormData): Record<string, any> {
    const object: Record<string, any> = {};

    formData.forEach((value, key) => {
        // Si la clé se termine par [], c'est un array
        if (key.endsWith('[]')) {
            const arrayKey = key.slice(0, -2); // Enlever []
            if (!object[arrayKey]) {
                object[arrayKey] = [];
            }
            object[arrayKey].push(value);
        } else {
            object[key] = value;
        }
    });

    return object;
}
