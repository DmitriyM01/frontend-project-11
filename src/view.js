import { setLocale, string } from 'yup';
import onChange from 'on-change';
import getRSS, { renderFeeds } from './rss.js';
import locale from '../locales/yupLocale.js'
import axios from 'axios';

export default (state, elements, i18nInstance) => {
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
            case 'posts':
                let id = 0;
                watchedState.posts.map((post) => {
                    post.id = id;
                    id += 1
                })
                renderFeeds(watchedState, elements, i18nInstance);
                break;
            case 'error':
                // console.log(value)
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
    return watchedState;
};
