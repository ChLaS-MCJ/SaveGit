import Axios from './Caller.service';

const PubService = {
    incrementViewCount: (pubId: number, codeInsee: string) => {
        return Axios.post(`/pubs/${pubId}/increment-view/${codeInsee}`);
    },
    incrementClickCount: (pubId: number, codeInsee: string) => {
        return Axios.post(`/pubs/${pubId}/increment-click/${codeInsee}`);
    },
};

export default PubService;
