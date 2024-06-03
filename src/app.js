import i18next from 'i18next';
import resources from '../locales/translation.js';
import render from './view.js';

const elements = {
    form: document.querySelector('form'),
    textInput: document.querySelector('#url-input'),
    feedback: document.querySelector('#feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    textNodes: {
        title: document.querySelector('title'),
        heading: document.querySelector('h1[class="display-3 mb-0"]'),
        subheading: document.querySelector('p[class="lead"]'),
        RSSLink: document.querySelector('label[for="url-input"]'),
        add: document.querySelector('button[type="submit"]'),
    },
};

export default async () => {
    const state = {
        value: '',
        error: '',
        feedback: '',
        language: 'ru',
        urls: [],
        feeds: [],
    };
    
    const i18nInstance = i18next.createInstance({
        lng: state.language,
        resources,
    }, (err, t) => {
        if (err) return console.log('something went wrong loading', err);
        t('key');
    });
    
    const loadTranslation = () => {
        Object.keys(elements.textNodes)
        .forEach((element) => {
            elements.textNodes[element].textContent = i18nInstance.t(element);
        });
    };
    loadTranslation();
    
    const watchedState = render(state, elements, i18nInstance);

    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = new FormData(elements.form);
        // trim() ВОЗМОЖНО придется ...УДАЛИТЬ... перед автоматической проверкой по причине того, 
        // что ломается валидация пустого поля
        const url = data.get('url').trim();
        watchedState.value = url;

    });

};
