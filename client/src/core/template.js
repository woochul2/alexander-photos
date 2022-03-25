/* eslint-disable class-methods-use-this */
import placeholder from '../../assets/placeholder.png';
import icons from '../icons';
import geometry from '../utils/geometry';

export default class Template {
  constructor() {
    this.loadingMessage = `
      <h2 class="loading__text">
        잠에서 깨어나는 중입니다. 잠시만 기다려주세요!
      </h2>
      <img
        class="loading__img"
        src="https://c.tenor.com/2C5_rB36nqMAAAAi/cute-sleepy.gif"
        alt="로딩 화면 이미지"
      />
    `;
    this.loadingError = `
      <p class="loading__error">사진을 불러오지 못했습니다.</p>
    `;
    this.uploadBtn = `
      ${icons.upload}
      업로드
    `;
    this.deleteConfirm = `
      <p class="photo-delete-confirm__description">
        삭제 후 이미지는 복구할 수 없습니다. 그래도 삭제하시겠습니까?
      </p>
      <div class="photo-delete-confirm__buttons">
        <button class="cancel-btn" aria-label="삭제 취소">취소</button>
        <button class="confirm-btn" aria-label="삭제 확인">삭제</button>
      </div>
    `;
  }

  /**
   * @param {object[]} p.files
   * @param {string} p.files.name
   * @param {number} p.files.dateTime
   * @param {Photo[]} photos
   */
  getUploadError(files, photos) {
    const getErrorType = ({ name, dateTime }) => {
      if (!/.+\.(jpe?g|png|gif)/.test(name)) {
        return '허용되지 않은 확장자';
      }

      const isSame = photos.find((photo) => {
        return photo.filePath.includes(name) && photo.dateTime === dateTime;
      });
      if (isSame) return '이미 존재하는 파일';

      return '용량 초과';
    };

    const listTemplate = files
      .map((file) => {
        getErrorType(file);
        return `<li>${file.name} (${getErrorType(file)})</li>`;
      })
      .join('');

    return `
       <div>
         업로드하지 못한 이미지가 있습니다.
         <ol>
           ${listTemplate}
         </ol>
       </div>
       <button
         class="upload-error__close-btn"
         aria-label="업로드 에러 닫기"
       >
         ╳
       </button>
     `;
  }

  /**
   * 이미지 높이를 쿼리 스트링으로 갖는 이미지 URL을 반환한다.
   *
   * @param {Photo} photo
   * @param {number | undefined} index
   * @param {string} endpoint
   */
  getImagePath(photo, index, endpoint) {
    const { filePath } = photo;

    let url;
    if (index === undefined) {
      url = `${endpoint}/image/${filePath}`;
    } else {
      const { height } = this.geometry.boxes[index];
      const h = height * window.devicePixelRatio;
      url = `${endpoint}/image/${filePath}?h=${h}`;
    }

    return encodeURI(url);
  }

  /**
   * @param {Photo} photo
   * @param {number} index
   * @param {string} endpoint
   */
  photo(photo, index, endpoint) {
    const { _id } = photo;
    const { width, height, top, left } = this.geometry.boxes[index];
    const imagePath = this.getImagePath(photo, index, endpoint);

    return `
      <a
        href="/${_id}"
        class="spa-link photo" 
        data-id="${_id}" 
        data-index="${index}"
        aria-label="사진 열기" 
        onclick="this.blur();"
        style="top: ${top}px; left: ${left}px;"
      >
        <img
          data-src=${imagePath}
          src=${placeholder}
          class="photo__img"
          style="height: ${Math.floor(height)}px; width: ${width}px;"
        >
      </a>
    `;
  }

  /**
   * @param {Photo[]} photos
   * @param {string} endpoint
   */
  photos(photos, endpoint) {
    this.geometry = geometry.main(photos);
    return photos
      .map((photo, index) => this.photo(photo, index, endpoint))
      .join('');
  }

  /**
   * @param {Object} param
   * @param {Photo} param.photo
   * @param {number | undefined} param.index
   * @param {string} param.endpoint
   */
  photoModal({ photo, index, endpoint }) {
    const imagePath = this.getImagePath(photo, index, endpoint);

    return `
      <img class="photo-modal__img" src=${imagePath} />
      <div class="photo-modal__top">
        <a
          href="/"
          class="spa-link photo-modal__close-btn"
          aria-label="사진 목록으로 돌아가기"
        >
          ${icons.arrow_left}
        </a>
        <div class="photo-modal__top-right">
          <div class="photo-info">
            <button
              class="photo-info__btn"
              aria-label="사진 정보 보기"
            >
              ${icons.info}
            </button>
            <div class="photo-info__detail"></div>
          </div>
          <button
            class="photo-modal__download-btn"
            aria-label="사진 원본 다운로드"
          >
            ${icons.download}
          </button>
          <div class="photo-delete">
            <button
              class="photo-delete__btn"
              aria-label="사진 삭제"
            >
              ${icons.trash}
            </button>
            <div class="photo-delete-confirm"></div>
          </div>
        </div>
      </div>
      <div class="photo-modal-move-container"></div>
    `;
  }

  /**
   * @param {Photo | undefined} prevPhoto
   * @param {Photo | undefined} nextPhoto
   */
  modalMoveBtn(prevPhoto, nextPhoto) {
    const prev = prevPhoto
      ? `
      <div class="photo-modal__move left">
        <a
          href="/${prevPhoto._id}"
          class="spa-link photo-modal__arrow-btn"
          aria-label="이전 사진 보기"
        >
          ${icons.chevron_left}
        </a>
      </div>`
      : '';

    const next = nextPhoto
      ? `
      <div class="photo-modal__move right">
        <a
          href="/${nextPhoto._id}"
          class="spa-link photo-modal__arrow-btn"
          aria-label="다음 사진 보기"
        >
          ${icons.chevron_left}
        </a>
      </div>`
      : '';

    return `
      ${prev}
      ${next}
    `;
  }

  /**
   * @param {Photo} photo
   */
  info(photo) {
    const {
      filePath,
      dateTime,
      make,
      model,
      pixelXDimension,
      pixelYDimension,
      width,
      height,
    } = photo;

    const fileName = filePath.split('/').pop();

    const dateTimeString = () => {
      const date = new Date(dateTime);

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const dateString = `${year}년 ${month}월 ${date.getDate()}일`;

      const addPad = (num) => num.toString().padStart(2, '0');
      const hours = addPad(date.getHours());
      const minutes = addPad(date.getMinutes());
      const timeString = `${hours}:${minutes}`;

      return `${dateString} ${timeString}`;
    };

    const pixel = () => {
      const px = pixelXDimension * pixelYDimension;
      if (px > 1000000) return `${Math.round(px / 100000) / 10}백만`;
      if (px > 10000) return `${Math.round(px / 10000)}만`;
      return px;
    };

    const camera = () => {
      if (!make || !model) return '';
      return `<li><b>카메라 모델</b>: ${make} ${model}</li>`;
    };

    return `
      <li><b>이름</b>: ${fileName}</li>
      <li><b>생성 날짜</b>: ${dateTimeString()}</li>
      <li><b>해상도</b>: ${pixel()} 화소 (${width}x${height})</li>
      ${camera()}
    `;
  }
}
