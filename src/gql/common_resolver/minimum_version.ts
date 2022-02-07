import { MinimuimVersion } from '../../models/minimum_version'

export const getMinimumVersion = () => {
    const minVersion: MinimuimVersion = {
        customTitle: 'Please update',
        customMessage: 'We got some great updates incoming.',
        minBuildNumber: 1,
    }
    return minVersion
}
