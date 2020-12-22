export interface Broker {
  username: string;
  name: string;
  fund: number;
}

export interface Share {
  company: string;
  distribution: 'linear' | 'normal';
  count: number;
  price: number;
}

export interface Settings {
  beginDate: string;
  beginTime: string;
  endDate: string;
  endTime: string;
  update: string;
}
