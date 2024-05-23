// import * as yup from 'yup';
import { string } from 'yup';
import './index.scss';

const form = document.querySelector('form');
const textInput = document.querySelector('#url-input');
const feedbackBox = document.querySelector('#feedback');

const schema = string().url().required();

const state = {
    previousValue: '',
    error: '',
};

form.addEventListener('submit', (event) => {
    event.preventDefault();


    const data = new FormData(form);
    const inputValue = data.get('url');

    if (inputValue === state.previousValue) state.textFeedBox = 'Такой RSS уже есть';

    if (!schema.isValidSync(inputValue)) state.textFeedBox = 'Ссылка должна быть валидным URL';

    if (state.error.length > 0) {
        feedbackBox.classList.remove('text-succes');
        feedbackBox.classList.add('text-danger');
        feedbackBox.textContent = state.error;
    }
    feedbackBox.textContent = 'RSS успешно загружен';
    textInput.value = '';
    textInput.focus();
    state.previousValue = inputValue;
});
