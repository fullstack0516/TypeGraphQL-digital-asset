import { Site, SiteModel } from '../../models/site_model'
import { ApolloError } from 'apollo-server-errors'

/**
 * Returns undefined if there's no site.
 */
export const fetchSiteViaUrl = async (url: string): Promise<Site> => {
    let site = (await SiteModel.findOne({ url }))?.toObject()
    if (!site) {
        throw new ApolloError('no-site', 'No site exists.')
    }
    // @ts-ignore
    delete site._id
    return site;
}
