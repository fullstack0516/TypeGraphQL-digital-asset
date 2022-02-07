import { LoremIpsum } from 'lorem-ipsum';
import Axios from 'axios';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator'
import { createTestUser } from './user_test';
import { createSite } from '../site_resolver/create_site';
import { User } from '../../models/user_model';
import { Site } from '../../models/site_model';

const createSiteName = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '',
        length: 1,
        style: 'capital',
    });
}

const createSiteUrl = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        length: 3,
        style: 'lowerCase',
    });
}

const createDesc = () => {
    const lorem = new LoremIpsum({
        sentencesPerParagraph: {
            max: 8,
            min: 4
        },
        wordsPerSentence: {
            max: 16,
            min: 4
        }
    });
    return lorem.generateSentences(Math.ceil((Math.random() + 1) * 5)).substr(0, 500);
}

export const createTestSite = async (props?: { user?: User, overrideData?: any }): Promise<Site> => {

    let user;

    if (props?.user) {
        user = props.user;
    } else {
        const data = await createTestUser();
        user = data.user
    }

    const pictureData = await Axios.get('https://picsum.photos/400/400')
    const photoUrl = pictureData.request.res.responseUrl;

    const sendData = {
        ...{
            name: createSiteName(),
            siteColor: '#FF0000',
            siteIcon: {
                type: 'photo',
                url: photoUrl,
            },
            description: createDesc().substr(0, 500),
            // Lower case and hypthens only.
            url: createSiteUrl(),
        },
        ...props?.overrideData ?? {},
    }

    const site = await createSite({
        user,
        ...sendData,
    })

    return site
}