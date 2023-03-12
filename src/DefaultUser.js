/**
 * Example user object
 */
module.exports = class DefaultUser {
    constructor() {
        this.id = '-1';
        this.name = 'Default User';
        this.email = 'test@example.com';
        this.type = 'local';
        this.canInstallRecommended = true;
        this.canUpdateAndInstallLibraries = true;
        this.canCreateRestricted = true;
    }

    id;
    name;
    email;
    type;
    canCreateRestricted;
    canInstallRecommended;
    canUpdateAndInstallLibraries;
}
