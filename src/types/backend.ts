export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: {
            id: string;
            name: string;
            permissions: {
                id: string;
                name: string;
                apiPath: string;
                method: string;
                module: string;
            }[]
        }
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface ICompany {
    id?: string;
    name?: string;
    address?: string;
    logo: string;
    description?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISkill {
    id?: string;
    name?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IUser {
    id: string;
    email: string;
    name: string;
    role: {
        id?: string;
        name?: string;
        permissions?: IPermission[]
    };
    company?: {
        id: number;
        name: string;
        address?: string;
        description?: string;
        logo?: string;
    };
    password?: string;
    age: number;
    gender: string;
    address: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IJob {
    id?: string;
    name: string;
    skills: ISkill[];
    company?: {
        id: string;
        name: string;
        logo?: string;
    }
    location: string;
    salary: number;
    quantity: number;
    level: string;
    description: string;
    startDate: Date;
    endDate: Date;
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICV {
    id?: string;
    title: string;
    profileSummary?: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    education?: string;
    experience?: string;
    skills?: string;
    customContent?: string;
    user?: IUser;
    job?: IJob;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateCVRequest {
    title: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    education?: string;
    experience?: string;
    skills?: string;
    customContent?: string;
    userId: number;
    jobId: number;
}

export interface IResume {
    id?: string;
    email: string;
    userId: string;
    url: string;
    status: string;
    companyId: string | {
        id: string;
        name: string;
        logo: string;
    };
    jobId: string | {
        id: string;
        name: string;
    };
    history?: {
        status: string;
        updatedAt: Date;
        updatedBy: { id: string; email: string }
    }[]
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IPermission {
    id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IRole {
    id?: string;
    name: string;
    description: string;
    active: boolean;
    permissions: IPermission[] | string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubscribers {
    id?: string;
    name?: string;
    email?: string;
    skills: string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IReview {
    id?: string;
    company: {
        id: string;
        name: string;
        logo?: string;
    };
    user: {
        id: string;
        name: string;
    };
    userName?: string;
    content: string;
    rating: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface ISubscriptionPackage {
    id: number;
    name: string;
    description: string;
    price: number;
    durationDays: number;
    jobPostLimit: number;
    isHighlighted: boolean;
    isPrioritized: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
    createdBy: string;
    updatedBy: string | null;
    displayPriority?: number;
    features?: string[];
    rewardPoints?: number;
}

export interface IEmployerSubscription {
    id: number;
    userId: number;
    companyId: number;
    packageId: number;
    package?: ISubscriptionPackage;
    startDate: string;
    endDate: string;
    isActive: boolean;
    paymentMethod: string;
    paymentStatus: string;
    jobPostsRemaining: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubscriptionStatus {
    hasActiveSubscription: boolean;
    activeSubscription?: IEmployerSubscription;
    jobPostsRemaining: number;
    canPostJob: boolean;
    daysRemaining: number;
}

export interface IPurchaseSubscriptionRequest {
    userId: number;
    companyId: number;
    packageId: number;
    paymentMethod: string;
} 