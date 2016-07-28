import { DevdayEvent, Address, AgendaEntry, AgendaEntryType } from './../definitions';

export const events: DevdayEvent[] = [
  {
    title: 'DevDay Technical Meetup',
    url: 'devday-technical-meetup',
    categories: ['events'],
    tags: ['technology'],
    author: 'devday_ team',
    abstract: 'DEVDAY is a monthly informal event for developers to share their experiences, ideas, opinions, and perspectives, about technology.',
    event_time: {
      start_time: new Date('2016-03-05T10:30:00+05:30')
    },
    publish_time: new Date('2016-03-05T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-03-05T10:30:00+05:30')
    },
    venue: {
  } as Address,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Database-Days of the future past',
        abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
        authors: [
          {
            name: "Avinash Nijampure"
          }
        ],
        time: {
          start_time: new Date('2016-03-05T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-03-05T11:15:00+05:30')
        },
        title: 'Tea Break'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        time: {
          start_time: new Date('2016-03-05T11:30:00+05:30')
        },
        title: 'SQLite: Why aren\'t you using it more?',
        abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
        authors: [
          {
            name: 'Srimathi Harinarayanan'
          },
          {
            name: 'Navaneeth KN'
          }
        ]
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-03-05T12:30:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ]
  }
];
export default events;
