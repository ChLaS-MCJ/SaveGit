import Axios from './Caller.service';

const getCollectByAdresse = async (code_insee: string, codeRivoli: string) => {
    try {
        const response = await Axios.get(`/search/insee/${code_insee}/rivoli/${codeRivoli}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching collect by commune:', error);
        throw error;
    }
};

const sendReport = async (reportData: object) => {
    try {
        const response = await Axios.post('/search/report', reportData);
        return response.data;
    } catch (error) {
        console.error('Error sending report:', error);
        throw error;
    }
};

const addCollecte = async (collecteData: object) => {
    try {
        const response = await Axios.post('/search/collecte/add', collecteData);
        return response.data;
    } catch (error) {
        console.error('Error adding collect:', error);
        throw error;
    }
};


const deleteCollecte = async (collecteId: string) => {
    try {
        const response = await Axios.delete(`/collecteadresse/${collecteId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting collecte:', error);
        throw error;
    }
};


export default {
    getCollectByAdresse,
    sendReport,
    addCollecte,
    deleteCollecte,
};
