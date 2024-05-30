import { setLocale, string } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import resources from '../locales/translation.js';

const elements = {
    form: document.querySelector('form'),
    textInput: document.querySelector('#url-input'),
    feedback: document.querySelector('#feedback'),
    textNodes: {
        title: document.querySelector('title'),
        heading: document.querySelector('h1[class="display-3 mb-0"]'),
        subheading: document.querySelector('p[class="lead"]'),
        RSSLink: document.querySelector('label[for="url-input"]'),
        add: document.querySelector('button[type="submit"]')
    }
};

export default async () => {
    const state = {
        previousValue: '',
        value: '',
        language: 'ru',
    };

    setLocale({
        string: {
            url: 2
        }
    })
    const schema = string().url().required();

    const watchedState = onChange(state, (path, value) => {
        switch(path) {
            case 'value':
                schema.validate(value)
                .then((url) => {
                    //Здесь происходит что-то, если урл валидный
                    elements.textInput.classList.remove('is-invalid');
                    elements.textInput.classList.add('is-valid');
                    elements.feedback.classList.remove('text-danger');
                    elements.feedback.classList.add('text-success');
                    elements.feedback.textContent = i18nInstance.t('feedbackRequest.success')
                    console.log(state)
                    // или не слишком валидный
                    if (url === state.previousValue) throw { errors: [1] };
                    state.previousValue = url;
                    state.value = '';
                })
                .catch((err) => {
                    // Здесь происходит что-то, если урл невалидный
                    elements.textInput.classList.remove('is-valid');
                    elements.textInput.classList.add('is-invalid');
                    elements.feedback.classList.remove('text-succes');
                    elements.feedback.classList.add('text-danger');
                    elements.feedback.textContent = i18nInstance.t(`feedbackRequest.${err.errors[0]}`);
                    console.log(state)
                })
                break;
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
        watchedState.value = data.get('url').trim();
    });
};