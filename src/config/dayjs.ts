import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi'; // Import locale tiếng Việt

// Extend dayjs với plugin relativeTime để sử dụng fromNow()
dayjs.extend(relativeTime);

// Mặc định sử dụng locale tiếng Việt
dayjs.locale('vi');

export default dayjs; 