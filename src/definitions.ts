import { DOMSource } from '@cycle/dom';
import { EventsSource } from './drivers/events';
import { MaterialSource } from './drivers/material';
import { MeetupsSource } from './drivers/meetups';
import { TalksSource, TalksResult } from './drivers/talks';
import { HistoryInput } from '@cycle/history';
import { RegistrationsSource, RegistrationRequest } from './drivers/registrations';
import { Stream, MemoryStream } from 'xstream';
import { VNode } from '@cycle/dom';
import { Snackbar } from './drivers/snackbars';

export interface Sources {
  dom: DOMSource;
  events: EventsSource;
  registrations: RegistrationsSource;
  history: MemoryStream<Location>;
  material: MaterialSource;
  meetups: MeetupsSource;
  talks: TalksSource;
}

export interface Sinks {
  dom: Stream<VNode>;
  events: Stream<string>;
  registrations: Stream<RegistrationRequest>;
  history: Stream<HistoryInput | string>;
  material: Stream<boolean>;
  talks: Stream<DevdayRegistrationData>;
  snackbars: Stream<Snackbar>;
}

export interface EventTime {
  start_time: Date;
  end_time?: Date;
}

export interface Address {
  line_one: string;
  line_two?: string;
  landmark?: string;
  locality?: string;
  city: string;
  zip: number;
  map_link: string;
  map_image: string;
}

export enum AgendaEntryType {
  Talk,
  Break,
  Workshop,
  Hackathon
}

export interface Author {
  name: string;
  twitter_handle?: string;
  github_username?: string;
  facebook_username?: string;
  linkedin_profile_url?: string;
  image_url?: string;
}

export interface AgendaEntry {
  type: AgendaEntryType;
  title: string;
  authors: Author[];
  time: EventTime;
  abstract: string;
}

export interface DevdayRegistrationForm {
  url?: string;
  name: string;
  email: string;
  mobile: string;
  type?: string;
  title?: string;
  abstract?: string;
  spreadsheetId?: string;
  sheetName?: string;
}

export interface DevdayRegistrationData {
  name: string;
  email: string;
  mobile: string;
  type?: string;
  present? : boolean;
  title?: string;
  abstract?: string;
}

export interface DevdayEvent {
  banner: boolean;
  title: string;
  url: string;
  categories: string[];
  tags: string[];
  author: string;
  abstract: string;
  event_time: EventTime;
  publish_time: Date;
  registration_time: EventTime;
  venue: Address;
  agenda: AgendaEntry[];
  image_url: string;
  meetup_urlname?: string;
  meetup_event_id?: string;
  attending?: number;
  form?: DevdayRegistrationForm;
  details?: string;
}

export interface MeetupEvent {
  event_url: string;
  yes_rsvp_count: number;
}
