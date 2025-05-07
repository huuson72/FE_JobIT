import { IPermission } from '@/types/backend';
import { grey, green, blue, red, orange } from '@ant-design/colors';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import dayjs from 'dayjs';

export const SKILLS_LIST =
    [
        { label: "React.JS", value: "REACT.JS" },
        { label: "React Native", value: "REACT NATIVE" },
        { label: "Vue.JS", value: "VUE.JS" },
        { label: "Angular", value: "ANGULAR" },
        { label: "Nest.JS", value: "NEST.JS" },
        { label: "TypeScript", value: "TYPESCRIPT" },
        { label: "Java", value: "JAVA" },
        { label: "Java Spring", value: "JAVA SPRING" },
        { label: "Frontend", value: "FRONTEND" },
        { label: "Backend", value: "BACKEND" },
        { label: "Fullstack", value: "FULLSTACK" }
    ];

export const LOCATION_LIST =
    [
        { label: "Hà Nội", value: "HANOI" },
        { label: "Hồ Chí Minh", value: "HOCHIMINH" },
        { label: "Đà Nẵng", value: "DANANG" },
        { label: "An Giang", value: "ANGIANG" },
        { label: "Bà Rịa - Vũng Tàu", value: "BARIAVUNGTAU" },
        { label: "Bắc Giang", value: "BACGIANG" },
        { label: "Bắc Kạn", value: "BACKAN" },
        { label: "Bạc Liêu", value: "BACLIEU" },
        { label: "Bắc Ninh", value: "BACNINH" },
        { label: "Bến Tre", value: "BENTRE" },
        { label: "Bình Định", value: "BINHDINH" },
        { label: "Bình Dương", value: "BINHDUONG" },
        { label: "Bình Phước", value: "BINHPHUOC" },
        { label: "Bình Thuận", value: "BINHTHUAN" },
        { label: "Cà Mau", value: "CAMAU" },
        { label: "Cần Thơ", value: "CANTHO" },
        { label: "Cao Bằng", value: "CAOBANG" },
        { label: "Đắk Lắk", value: "DAKLAK" },
        { label: "Đắk Nông", value: "DAKNONG" },
        { label: "Điện Biên", value: "DIENBIEN" },
        { label: "Đồng Nai", value: "DONGNAI" },
        { label: "Đồng Tháp", value: "DONGTHAP" },
        { label: "Gia Lai", value: "GIALAI" },
        { label: "Hà Giang", value: "HAGIANG" },
        { label: "Hà Nam", value: "HANAM" },
        { label: "Hà Tĩnh", value: "HATINH" },
        { label: "Hải Dương", value: "HAIDUONG" },
        { label: "Hải Phòng", value: "HAIPHONG" },
        { label: "Hậu Giang", value: "HAUGIANG" },
        { label: "Hòa Bình", value: "HOABINH" },
        { label: "Hưng Yên", value: "HUNGYEN" },
        { label: "Khánh Hòa", value: "KHANHHOA" },
        { label: "Kiên Giang", value: "KIENGIANG" },
        { label: "Kon Tum", value: "KONTUM" },
        { label: "Lai Châu", value: "LAICHAU" },
        { label: "Lâm Đồng", value: "LAMDONG" },
        { label: "Lạng Sơn", value: "LANGSON" },
        { label: "Lào Cai", value: "LAOCAI" },
        { label: "Long An", value: "LONGAN" },
        { label: "Nam Định", value: "NAMDINH" },
        { label: "Nghệ An", value: "NGHEAN" },
        { label: "Ninh Bình", value: "NINHBINH" },
        { label: "Ninh Thuận", value: "NINHTHUAN" },
        { label: "Phú Thọ", value: "PHUTHO" },
        { label: "Phú Yên", value: "PHUYEN" },
        { label: "Quảng Bình", value: "QUANGBINH" },
        { label: "Quảng Nam", value: "QUANGNAM" },
        { label: "Quảng Ngãi", value: "QUANGNGAI" },
        { label: "Quảng Ninh", value: "QUANGNINH" },
        { label: "Quảng Trị", value: "QUANGTRI" },
        { label: "Sóc Trăng", value: "SOCTRANG" },
        { label: "Sơn La", value: "SONLA" },
        { label: "Tây Ninh", value: "TAYNINH" },
        { label: "Thái Bình", value: "THAIBINH" },
        { label: "Thái Nguyên", value: "THAINGUYEN" },
        { label: "Thanh Hóa", value: "THANHHOA" },
        { label: "Thừa Thiên Huế", value: "THUATHIENHUE" },
        { label: "Tiền Giang", value: "TIENGIANG" },
        { label: "Trà Vinh", value: "TRAVINH" },
        { label: "Tuyên Quang", value: "TUYENQUANG" },
        { label: "Vĩnh Long", value: "VINHLONG" },
        { label: "Vĩnh Phúc", value: "VINHPHUC" },
        { label: "Yên Bái", value: "YENBAI" }
    ];

export const nonAccentVietnamese = (str: string) => {
    str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str;
}


export const convertSlug = (str: string) => {
    str = nonAccentVietnamese(str);
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
    const to = "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
    for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

export const getLocationName = (value: string) => {
    const locationFilter = LOCATION_LIST.filter(item => item.value === value);
    if (locationFilter.length) return locationFilter[0].label;
    return 'unknown'
}

export function colorMethod(method: "POST" | "PUT" | "GET" | "DELETE" | string) {
    switch (method) {
        case "POST":
            return green[6]
        case "PUT":
            return orange[6]
        case "GET":
            return blue[6]
        case "DELETE":
            return red[6]
        default:
            return grey[10];
    }
}

export const groupByPermission = (data: any[]): { module: string; permissions: IPermission[] }[] => {
    const groupedData = groupBy(data, x => x.module);
    return map(groupedData, (value, key) => {
        return { module: key, permissions: value as IPermission[] };
    });
};

export const calculateDaysFromNow = (date: string | Date): string => {
    const now = dayjs();
    const targetDate = dayjs(date);
    const diffInDays = now.diff(targetDate, 'day');
    
    if (diffInDays === 0) return 'hôm nay';
    if (diffInDays === 1) return '1 ngày trước';
    return `${diffInDays} ngày trước`;
};

export const convertRelativeTime = (timeString: string): string => {
    // First try to extract the number and unit
    const matches = timeString.match(/(\d+)\s*(秒前|分钟前|小时前|天前|周前|个月前|年前)/);
    if (!matches) return timeString;

    const number = matches[1];
    const unit = matches[2];

    // Convert Chinese units to Vietnamese
    const timeMap: { [key: string]: string } = {
        '秒前': 'giây trước',
        '分钟前': 'phút trước',
        '小时前': 'giờ trước',
        '天前': 'ngày trước',
        '周前': 'tuần trước',
        '个月前': 'tháng trước',
        '年前': 'năm trước'
    };

    const vietnameseUnit = timeMap[unit] || unit;
    return `${number} ${vietnameseUnit}`;
};
