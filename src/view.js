import { setLocale, string } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import { renderFeeds } from './rss.js';
import getRSS from './rss.js';
import locale from '../locales/yupLocale.js'
import resources from '../locales/translation.js';

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

    setLocale(locale);
    const schema = string().url().required();

    const watchedState = onChange(state, (path, value) => {
        switch (path) {
            case 'value':
                schema.notOneOf(state.urls)
                .validate(value)
                .then((url) => {
                    // Здесь происходит что-то, если урл валидный
                    getRSS(url, watchedState, i18nInstance);
                    state.urls.push(url);
                    state.value = '';
                    elements.textInput.value = '';
                })
                .catch((err) => {
                    // Здесь происходит что-то, если урл невалидный
                    watchedState.error = err.message
                });
                break;
            case 'feeds':
                renderFeeds(watchedState, elements, i18nInstance)
                elements.textInput.classList.remove('is-invalid');
                elements.textInput.classList.add('is-valid');
                elements.feedback.classList.remove('text-danger');
                elements.feedback.classList.add('text-success');
                elements.feedback.textContent = i18nInstance.t('feedbackRequest.success');
                break;
            case 'error':
                console.log(value)
                elements.textInput.classList.remove('is-valid');
                elements.textInput.classList.add('is-invalid');
                elements.feedback.classList.remove('text-succes');
                elements.feedback.classList.add('text-danger');
                elements.feedback.textContent = i18nInstance.t(`feedbackRequest.${value}`);
                break;
            default:
                console.log(path);
        }
    });

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

    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = new FormData(elements.form);
        const url = data.get('url').trim();
        watchedState.value = url;

    });
};
