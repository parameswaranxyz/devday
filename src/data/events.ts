import { DevdayEvent, Address, AgendaEntry, AgendaEntryType } from './../definitions';

export const BANGALORE_ADDRESS: Address = {
      line_one: '#365, 3rd Floor, Sulochana Building',
      line_two: '1st Cross Road, 3rd Block, Sarjapura Main Road',
      locality: 'Koramangala',
      city: 'Bangalore',
      zip: 560034,
      map_link: 'https://goo.gl/maps/ziSASk4tmvM2',
      map_image: '/images/bangalore-map.jpg'
    };
export const CHENNAI_ADDRESS: Address = {
      line_one: 'Sahaj Software Solutions Pvt. Ltd.',
      line_two: 'Type 2/15, Dr.V.S.I Estate, Rajiv Gandhi Salai',
      locality: 'Thiruvanmiyur',
      city: 'Chennai',
      zip: 600041,
      map_link: 'https://goo.gl/maps/7Z8iBAdjT1o',
      map_image: '/images/chennai-map.png'
    };

export const events: DevdayEvent[] = [
  {
    title: 'Data science: How it helps',
    url: 'data-science-how-it-helps',
    categories: ['events'],
    tags: ['data-science'],
    author: 'devday_team',
    abstract: 'On this 3 Edition of DevDay, we have Viral B. Shah, co-inventor of JuliaLang, and other speakers from Sahaj, to share their  experiences and learnings on Data Science.',
    event_time: {
      start_time: new Date('2016-05-07T10:30:00+05:30'),
      end_time: new Date('2016-05-07T13:30:00+05:30'),
    },
    publish_time: new Date('2016-05-07T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-05-07T10:30:00+05:30'),
      end_time: new Date('2016-05-07T13:30:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Julia - A fresh approach to data science and technical computing',
        abstract: '',
        authors: [
          {
            name: "Viral B. Shah",
            image_url: 'images/speakers/viral-shah.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-05-07T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-04-02T11:15:00+05:30')
        },
        title: 'Tea Break'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Applied data science for developers',
        abstract: '',
        authors: [
          {
            name: 'Dileep Bapat',
            image_url: 'images/speakers/dileep.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-05-07T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-05-07T13:00:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ]
  },
  {
    title: 'All about databases',
    url: 'all-about-databases',
    categories: ['events'],
    tags: ['databases','sqlite','event streams'],
    author: 'devday_team',
    abstract: 'A Date with Databases. This meet up would be all about Databases - the internals and the overall. The idea is to tear down databases, across relational/non relational, and understand them deep down.',
    event_time: {
      start_time: new Date('2016-06-04T10:30:00+05:30'),
      end_time: new Date('2016-06-04T13:30:00+05:30'),
    },
    publish_time: new Date('2016-06-04T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-06-04T10:30:00+05:30'),
      end_time: new Date('2016-06-04T10:30:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Databases: Days of the future past',
        abstract: '',
        authors: [
          {
            name: "Avinash Nijampure"
          }
        ],
        time: {
          start_time: new Date('2016-06-04T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-06-04T11:15:00+05:30')
        },
        title: 'Tea and snacks'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'SQLite: Why aren\'t you using it more?',
        abstract: '',
        authors: [
          {
            name: 'Srimathi Harinarayanan',
            image_url: 'images/speakers/srimathi.jpg'
          },
          {
            name: 'Navaneeth KN',
            image_url: 'images/speakers/navneeth.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-06-04T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Databases as event streams',
        abstract: '',
        authors: [
          {
            name: 'Shashank Teotia',
            image_url: 'images/speakers/shashank-teotia.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-06-04T12:15:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-06-04T13:00:00+05:30')
        },
        title: 'Lunch'
      } as AgendaEntry
    ]
  },
  {
    title: 'Arduino Day',
    url: 'arduino-day',
    categories: ['events'],
    tags: ['arduino-genuino-iot'],
    author: 'devday_team',
    abstract: 'Arduino Day is a worldwide birthday celebration of Arduino and Genuino. It\'s a one day event –organized directly by the community, or by the Arduino founders– where people interested in Arduino and Genuino get together, share their experiences, and learn more.',
    event_time: {
      start_time: new Date('2016-04-02T10:30:00+05:30'),
      end_time: new Date('2016-04-02T14:30:00+05:30'),
    },
    publish_time: new Date('2016-04-02T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-04-02T10:30:00+05:30'),
      end_time: new Date('2016-04-02T10:30:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Adventures with Arduino',
        abstract: '',
        authors: [
          {
            name: "Himesh Reddivari",
            image_url: 'images/speakers/himesh-reddivari.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-04-02T11:15:00+05:30')
        },
        title: 'Tea Break'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Journey of Samvid',
        abstract: '',
        authors: [
          {
            name: 'Shashank Teotia',
            image_url: 'images/speakers/shashank-teotia.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Simple obstacle avoiding Robot using Arduino',
        abstract: '',
        authors: [
          {
            name: 'Deepak Nararyana Rao',
            image_url: 'images/speakers/deepak.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T12:15:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Workshop on Arduino',
        abstract: '',
        authors: [
          {
            name: 'Dileep Bapat',
            image_url: 'images/speakers/dileep.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T13:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-06-04T13:45:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ]
  },
  {
    title: 'DevDay',
    url: 'first-devday',
    categories: ['events'],
    tags: ['devday', 'Neo4j', 'patttern to scale mobile', 'IOT'],
    author: 'devday_team',
    abstract: 'DevDay is a monthly informal event for developers to share their experiences, ideas, opinions & perspectives about technology',
    event_time: {
      start_time: new Date('2016-03-05T10:30:00+05:30'),
      end_time: new Date('2016-03-03T13:00:00+05:30'),
    },
    publish_time: new Date('2016-02-27T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-02-27T10:30:00+05:30'),
      end_time: new Date('2016-03-05T10:00:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Neo4j - Graph Database',
        abstract: '',
        authors: [
          {
            name: 'Mahesh Lal',
            image_url: 'images/speakers/mahesh-lal.png'
          }
        ],
        time: {
          start_time: new Date('2016-03-05T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-03-05T11:30:00+05:30')
        },
        title: 'Tea Break'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Patterns to Scale Mobile Developmen',
        abstract: '',
        authors: [
          {
            name: "Priyank Gupta",
            image_url: 'images/speakers/priyank.png'
          }
        ],
        time: {
          start_time: new Date('2016-03-05T11:45:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'IOT (Lightning Talk)',
        abstract: '',
        authors: [
          {
            name: 'Dileep Bapat',
            image_url: 'images/speakers/dileep.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-03-05T12:45:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'IOT (Lightning Talk)',
        abstract: '',
        authors: [
          {
            name: 'Mahesh B R',
            image_url: 'images/speakers/mahesh.png'
          }
        ],
        time: {
          start_time: new Date('2016-03-05T13:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-03-05T13:15:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ]
  },
  {
    title: 'DevOps in Cloud',
    url: 'devops-in-cloud',
    categories: ['events'],
    tags: ['cloud computing','cloud', 'devops'],
    author: 'devday_team',
    abstract: 'Upload. Download. Dock. Serve. Functions on demand. Everything to do with the cloud.',
    event_time: {
      start_time: new Date('2016-07-16T10:30:00+05:30'),
      end_time: new Date('2016-07-16T13:30:00+05:30'),
    },
    publish_time: new Date('2016-07-08T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-07-08T10:30:00+05:30'),
      end_time: new Date('2016-07-16T10:15:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Product For Blue - Green Deployments Verification',
        abstract: '',
        authors: [
          {
            name: "Srikanth Seshadri",
            image_url: 'images/speakers/srikanth.png'
          }
        ],
        time: {
          start_time: new Date('2016-07-09T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-07-09T11:15:00+05:30')
        },
        title: 'Tea and snacks'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Misconceptions of cloud: Automation!',
        abstract: '',
        authors: [
          {
            name: 'Arther Antony',
            image_url: 'images/speakers/arther.png'
          }
        ],
        time: {
          start_time: new Date('2016-07-09T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to DevOps, the pain-points and the frameworks',
        abstract: '',
        authors: [
          {
            name: 'Raghavendrra Mahesh',
            image_url: 'images/speakers/mahesh.png'
          }
        ],
        time: {
          start_time: new Date('2016-07-09T12:15:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-07-09T13:00:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ],
    color: 'black',
    image_url: 'images/events/cloud_computing.jpg'
  },
  {
    title: 'JS Everywhere',
    url: 'js-everywhere',
    categories: ['events'],
    tags: ['js','javascript', 'react-native', 'cycle-js'],
    author: 'devday_team',
    abstract: 'Desktop or offline applications? We\'ve got you covered. Reactive applications? Try cycle. Native moblie applications? We have React Native. Internet of Things? Johnny Five\'s here to help. JavaScript has evolved into one of the easiest and ubiquitous language around, and it looks like there isn\'t much that can\'t be done with it. JS Everywhere - Let\'s rejoice!',
    event_time: {
      start_time: new Date('2016-08-04T18:30:00+05:30'),
      end_time: new Date('2016-08-04T20:30:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-08-04T18:30:00+05:30'),
      end_time: new Date('2016-08-04T18:30:00+05:30')
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Creating offline/desktop applications using Electron',
        abstract: '',
        authors: [
          {
            name: 'Sairam Krishnamurthy',
            image_url: 'images/speakers/sairam.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Building native mobile applications using React Native',
        abstract: '',
        authors: [
          {
            name: 'Vagmi Mudumbai',
            image_url: 'images/speakers/vagmi.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T19:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Functional Reactive Programming with Cycle.js',
        abstract: '',
        authors: [
          {
            name: 'Sudarsan Balaji',
            image_url: 'images/speakers/sudarsan.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T19:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Writing for IoT using Johnny-Five',
        abstract: '',
        authors: [
          {
            name: 'Raj Bharath Kannan',
            image_url: 'images/speakers/raj.png'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T13:00:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#f7df1e',
    background_size: '200px',
    image_url: 'images/events/js_everywhere.png',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '232886624'
  },
  {
    title: 'Functional programming: Hands on Elixir',
    url: 'hands-on-elixir',
    categories: ['events'],
    tags: ['elixir','functional programming', 'concurrent programming'],
    author: 'devday_team',
    abstract: 'We bring to you Elixir - a concurrent, functional programming language.',
    event_time: {
      start_time: new Date('2016-08-27T10:30:00+05:30'),
      end_time: new Date('2016-08-28T13:30:00+05:30'),
    },
    publish_time: new Date('2016-07-09T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-08-27T10:30:00+05:30'),
      end_time: new Date('2016-08-28T13:30:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Workshop,
        title: 'Hands-On with Elixir',
        abstract: '',
        authors: [
          {
            name: "Navaneeth N",
            image_url: 'images/speakers/navneeth.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-27T10:30:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#211b33',
    image_url: 'images/events/tasting_elixir.jpg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '233530425'
  },
  {
    title: 'This time it\'s real-time',
    url: 'its-real-time',
    categories: ['events'],
    tags: ['real-time','rtc', 'webrtc', 'peer-js'],
    author: 'devday_team',
    abstract: 'In this edition of Dev Day (Chennai) we have talks scheduled on RTC. Come learn about aspects of real time communication and the way real time systems are built.',
    event_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-09-10T13:00:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-09-10T13:00:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Realtime Chat using Socket.io on Production',
        abstract: 'The web has typically been a client request server protocol from the beginning of time. Websockets are starting to change that with a bi-directional data flow. This talk will explore how socket.io, a framework for websockets was used to develop a chat application that was on production.',
        authors: [
          {
            name: 'Arvind Sridharan',
            image_url: 'images/speakers/arvind.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T10:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Real Time Communication, Fast and Slow',
        abstract: 'Browsers and servers have always constituted a distributed system, and with the rise of (micro?)services, servers have now become distributed systems too. The fundamental need of any of these systems is to communicate effectively - we\'ll look at the various options and methods of doing just that.',
        authors: [
          {
            name: 'Sudhir Jonathan',
            image_url: 'images/speakers/sudhir.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T11:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Getting started with WebRTC',
        abstract: 'WebRTC is a framework for the web that enables Real Time Communication in the browser. Get to know about WebRTC technology & also learn how to build a webrtc application.',
        authors: [
          {
            name: 'Vijayakumar Nagarajan',
            image_url: 'images/speakers/vijayakumar.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T12:00:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: 'images/events/its_real_time.jpg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '232886624',
    form: {
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSd7wUzgQ7VuP3z41GtnTemaxFzv-4K10TuBHjCZqjcI8xxDJA/formResponse',
      name: 'entry.2092238618',
      email: 'entry.1556369182',
      mobile: 'entry.479301265',
      type: 'entry.630971362',
      title: 'entry.1832696420',
      abstract: 'entry.354689399'
    }
  },
  {
    title: 'Math For Machine Learning',
    url: 'math-for-machine-learning',
    categories: ['Machine Learning'],
    tags: ['Machine Learning','Math', 'Data Science'],
    author: 'devday_team',
    abstract: 'Learn about the basic math and algorithms required for machine learning',
    event_time: {
      start_time: new Date('2016-11-19T10:30:00+05:30'),
      end_time: new Date('2016-11-19T10:00:00+05:30')
    },
    publish_time: new Date('2016-11-11T23:45:00+05:30'),
    registration_time: {
      start_time: new Date('2016-11-11T23:45:00+05:30'),
      end_time: new Date('2016-11-19T09:45:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
       {
        type: AgendaEntryType.Talk,
        title: 'Basic concepts of statistics and introduction to ML',
        abstract: 'Get started with basic statistics and see them in action with real-time datasets. Discuss the basic definitions of machine learning and also about when and when not to use ML. We will be using Python notebook to demonstrate the concepts.',
        authors: [
          {
            name: 'Deepthi Chand',
            image_url: '/images/speakers/deepthi.png'
          }
        ],
        time: {
          start_time: new Date('2016-11-19T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Diving into machine learning with simple maths and statistics',
        abstract: "Ever felt intimidated by the nuances and world of machine learning? Come and hear someone reason about it using rudimentary maths and concepts like Euclidean distance and Pearson's correlation score to build a super simple recommendation engine and unsupervised clusters of data. Understand how linear regression allows for predictive capabilities on datasets. Look at how to build simple classifiers using python libraries without understanding the guts of machine learning. This talk uses python for the code. Classifiers are built using the nltk library with Python.",
        authors: [
          {
            name: 'Priyank Gupta',
            image_url: '/images/speakers/priyank.png'
          }
        ],
        time: {
          start_time: new Date('2016-11-19T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to Linear Regression',
        abstract: '',
        authors: [
          {
            name: 'Shashank Teotia',
            image_url: '/images/speakers/shashank-teotia.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-11-19T12:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#211b33',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '235590887',
    form: {
      spreadsheetId : '1xR-opuZ3sIEvjktfzpkuC60J3gJNlRExMYP74Ym4zwo',
      sheetName : 'Form Responses 1'
    },
    image_url: '/images/events/hackathon.jpg',
  },
  {
    title: 'DevOps for Devs',
    url: 'devops-for-devs',
    categories: ['events'],
    tags: ['devops'],
    author: 'devday_team',
    abstract: 'In this edition of the Dev Day, we are presenting talks on Devops - "DevOps for Devs". Come join us to understand why "DevOps" is relevant today from a technology standpoint',
    event_time: {
      start_time: new Date('2016-10-13T18:30:00+05:30'),
      end_time: new Date('2016-10-13T20:30:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-10-13T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'DevOps 101',
        abstract: '',
        authors: [
          {
            name: 'Srimathi Harinarayanan',
            image_url: 'images/speakers/srimathi.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-13T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Ephemeral Infrastructure',
        abstract: '',
        authors: [
          {
            name: 'Mahesh and Arther',
            image_url: 'images/speakers/arther.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-13T18:45:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Kubernetes in Production',
        abstract: 'In this talk, Manoj will be talking about the Kubernetes setup at Indix which has been running for the last 10 months now. He will be going into the details of bringing up and managing a Kubernetes cluster and the features of Kubernetes that they use at Indix.',
        authors: [
          {
            name: 'Manoj Mahalingam',
            image_url: '/images/speakers/manoj.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-13T19:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/devops-for-devs.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '234495890',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Hack Hack and just Hack!',
    url: 'hack-and-just-hack',
    categories: ['Hackathon'],
    tags: ['IOT', 'Machine Learning', 'Data Science'],
    author: 'devday_team',
    abstract: "This time let's just code to make amazing products. Software/hardware and all things awesome.",
    event_time: {
      start_time: new Date('2016-10-15T10:00:00+05:30'),
      end_time: new Date('2016-10-15T17:30:00+05:30')
    },
    publish_time: new Date('2016-10-07T23:45:00+05:30'),
    registration_time: {
      start_time: new Date('2016-10-07T23:45:00+05:30'),
      end_time: new Date('2016-10-15T09:45:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
       {
        type: AgendaEntryType.Talk,
        title: 'Hack Hack and just Hack!',
        abstract: 'Problem Statements:-\n\r 1. Design and develop a device/wearable that has the capability to detect the direction and intensity of sound (the required hardware would be provided at the venue). \n\r 2. Classification of certain datasets using machine learning algorithms (Dataset would be provided). \n\r 3. Device a solution to predict an indoor location of a entity (hardware would be provided).',
        time: {
          start_time: new Date('2016-10-15T10:00:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#211b33',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '235590887',
    form: {
      spreadsheetId : '1xR-opuZ3sIEvjktfzpkuC60J3gJNlRExMYP74Ym4zwo',
      sheetName : 'Form Responses 1'
    },
    image_url: '/images/events/hackathon.jpg',
  },
  {
    title: 'Cross Platform Mobile Apps',
    url: 'cross-platform-mobile-apps-handson',
    categories: ['events'],
    tags: ['cross platform','mobile apps','handson'],
    author: 'devday_team',
    abstract: 'Participants will form teams and pick a technology of their interest (i.e. Xamarin, Cordova, React Native) to build a cross platform mobile app. The app to be built is a todo list where users can add todo items with a photo and a location. The problem has been designed so that it can be built within a few hours.',
    event_time: {
      start_time: new Date('2016-11-19T10:00:00+05:30'),
      end_time: new Date('2016-11-19T15:00:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-11-19T10:00:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Workshop,
        title: 'Introduction',
        abstract: 'A brief introduction to the event format along with a detailed explanation of the problem.',
        time: {
          start_time: new Date('2016-11-19T10:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Team Formation',
        abstract: 'Participants will form teams based on their interest.',
        time: {
          start_time: new Date('2016-11-19T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Get cracking with the code',
        abstract: 'Teams can organise their own lunch breaks during the coding time. Lunch will be provided by Sahaj.',
        time: {
          start_time: new Date('2016-11-19T10:45:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Showcase and discussion',
        abstract: 'All the apps built will be showcased. This will be followed by a discussion on pros and cons of the technologies they the individual teams would have used to solve the problem.',
        time: {
          start_time: new Date('2016-11-19T14:00:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: 'images/events/cross_platform.jpg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '235318558',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Coding a Tic Tac Toe Game',
    url: 'game-programming-101',
    categories: ['events'],
    tags: ['tic tac toe', 'game Programming 101'],
    author: 'devday_team',
    abstract: 'Ever thought playing tic-tac-toe was easy? Let’s learn to build a tic-tac-toe program that can beat us every time – on a grid of any size, not just 3x3. We will be learning about modelling a game, writing an evaluation function, and searching for the optimal move. What’s more, all that we learn can be used to program for chess! ',
    event_time: {
      start_time: new Date('2017-01-19T18:30:00+05:30'),
      end_time: new Date('2017-01-19T20:30:00+05:30'),
    },
    publish_time: new Date('2017-01-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-01-02T18:30:00+05:30'),
      end_time: new Date('2017-01-19T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Writing a tic-tac-toe program that can beat you every time',
        abstract: '',
        authors: [
          {
            name: 'Sudarsan Balaji',
            image_url: 'images/speakers/sudarsan.png'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:00:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '236605725',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  }, {
    title: 'First Dive into Deep Learning',
    url: 'first-dive-deep-learning',
    categories: ['events'],
    tags: ['deep learning', 'data science'],
    author: 'devday_team',
    abstract: 'This time lets discuss basic concepts of Deep Learning and gets our hands dirty by solving a problem using the very basics we discussed.',
    event_time: {
      start_time: new Date('2016-12-10T11:00:00+05:30'),
      end_time: new Date('2016-12-10T16:00:00+05:30'),
    },
    publish_time: new Date('2016-12-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-12-02T10:30:00+05:30'),
      end_time: new Date('2016-12-10T18:30:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
       {
        type: AgendaEntryType.Talk,
        title: 'Introduction to Deep learning ',
        abstract: '',
        authors: [
        ],
        time: {
          start_time: new Date('2016-12-10T11:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Basic concepts of Deep Learning',
        abstract: '',
        authors: [
        ],
        time: {
          start_time: new Date('2016-12-10T12:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-02-10T13:00:00+05:30')
        },
        title: 'Lunch and Networking'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Hands - on Deep Learning',
        abstract: '',
        authors: [
        ],
        time: {
          start_time: new Date('2016-12-10T14:00:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#211b33',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '235960569',
    form: {
      spreadsheetId : '1xR-opuZ3sIEvjktfzpkuC60J3gJNlRExMYP74Ym4zwo',
      sheetName : 'Form Responses 1'
    },
    image_url: '',
  },
  {
    title: 'Know NoSQL',
    url: 'know-nosql',
    categories: ['events'],
    tags: ['NoSQL', 'CouchDB'],
    author: 'devday_team',
    abstract: 'In this edition of DevDay we will start with an introduction to NoSQL and the various types of NoSQL stores followed by a talk on how CouchDB was used in production',
    event_time: {
      start_time: new Date('2017-02-16T18:30:00+05:30'),
      end_time: new Date('2017-02-16T20:30:00+05:30'),
    },
    publish_time: new Date('2017-01-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-01-02T18:30:00+05:30'),
      end_time: new Date('2017-02-16T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'NoSQL 101',
        abstract: 'We start the devday by exploring different types of NoSQL databases and discuss scenarios where each type of NoSQL store are typically used.',
        authors: [
          {
            name: 'Ramanathan',
            image_url: '/images/speakers/ramanathan.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'A deep dive into CouchDB',
        abstract: 'In this talk we will discuss how various features of CouchDB (i.e. MapReduce, indices, sorting) were used in production in context of the CAP theorem.',
        authors: [
          {
            name: 'Raj Bharath',
            image_url: '/images/speakers/raj.png'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T19:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '237520259',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Microservice Architectures - How To?',
    url: 'microservice-architectue',
    categories: ['events'],
    tags: ['microservice', 'distributed', 'microservice architecture'],
    author: 'devday_team',
    abstract: 'This time we are talking about the implementation of Microservice Architectures. Scaling, distribution, inter service communication and so on..',
    event_time: {
      start_time: new Date('2017-02-16T17:30:00+05:30'),
      end_time: new Date('2017-02-16T19:30:00+05:30'),
    },
    publish_time: new Date('2017-02-09T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-02-09T18:30:00+05:30'),
      end_time: new Date('2017-02-16T17:30:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Microservices - Check List',
        abstract: 'Kickoff with nuts and bolts needed for implementing microservice.',
        authors: [
          {
            name: 'Navaneeth K N',
            image_url: '/images/speakers/navneeth.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T17:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Monolith to Microservice - A case study.',
        abstract: 'This session takes you to a case study about trasnforming a giant monolith application to a distributed microservice application.',
        authors: [
          {
            name: 'Thirunavukkarasu',
            image_url: '/images/speakers/thiru.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/hackathon.jpg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '237578088',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Architecture',
    url: 'architecture',
    categories: ['events'],
    tags: ['Architecture', 'load', 'microservices'],
    author: 'devday_team',
    abstract: 'We start this DevDay by exploring a case study on managing a high load system followed by a discussion on microservices',
    event_time: {
      start_time: new Date('2017-03-16T18:30:00+05:30'),
      end_time: new Date('2017-03-16T20:30:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-03-02T18:30:00+05:30'),
      end_time: new Date('2017-03-16T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Experience with high load system design',
        abstract: 'I had an opportunity to design and implement a system to monitor the activity of a performant cloud deployment solution. The talk is about my experience in design and architecture of such a system; the trade offs made; things that failed to work etc.',
        authors: [
          {
            name: 'Srikanth Seshadri',
            image_url: '/images/speakers/srikanth.png'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Microservices - what, why and how?',
        abstract: 'In this talk we will explore what microservices is, why you should or should not move to a microservice architecture as well as discuss some best practices',
        authors: [
          {
            name: 'Arvind Sridharan',
            image_url: '/images/speakers/arvind.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T19:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '238210259',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Distributed Systems and Serverless Architecture',
    url: 'distributed-systems-and-serverless-architecture',
    categories: ['events'],
    tags: ['Architecture', 'load', 'microservices'],
    author: 'devday_team',
    abstract: '',
    event_time: {
      start_time: new Date('2017-04-20T18:30:00+05:30'),
      end_time: new Date('2017-04-20T20:30:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-03-02T18:30:00+05:30'),
      end_time: new Date('2017-04-20T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Serverless Architecture',
        abstract: 'The talk will start with an introduction to serverless architecture and why it is so hot now. From the basics we will explore web jobs, creating and running azure functions and integration of azure functions with logic apps.',
        authors: [
          {
            name: 'Karthikeyan VK, Web Application Architect at CADS Software',
            image_url: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAYQAAAAJDFkZDgyYjk1LTllZjYtNDE3OC1iNzNlLTI2MWNmMTljMDIyZQ.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Suuchi - Toolkit for building Distributed Data systems',
        abstract: 'Suuchi is a Scala library that can be used for building distributed data systems. I\'ll be talking about the motivation for building such a library and a simple code walk through at the end on how to build such a simple distributed KV store using Suuchi.',
        authors: [
          {
            name: 'Ashwanth Kumar, Software Engineer at Indix',
            image_url: '/images/speakers/ashwanth.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T19:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/hackathon.jpg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '238855098',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Should you "React" js',
    url: 'should-you-react-js',
    categories: ['events'],
    tags: ['react', 'vue', 'mithril', 'javsacript', 'js', 'frontend'],
    author: 'devday_team',
    abstract: 'This DevDay, we start off by talking about various javascript frameworks and how to pick one. We will then drill down to a particular javascript framework as part of the second talk.',
    event_time: {
      start_time: new Date('2017-05-18T18:30:00+05:30'),
      end_time: new Date('2017-05-18T20:30:00+05:30'),
    },
    publish_time: new Date('2017-03-02T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-03-02T18:30:00+05:30'),
      end_time: new Date('2017-05-18T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'React.js Vue.js Mithril.js - How do you decide?',
        abstract: 'Recently there are lots of JavaScript frameworks to pick from and they are very different from the way they have been designed to solve a same problem. I will compare and explain these design ideas and how they fare based on my project work experience in all these 3 frameworks',
        authors: [
          {
            name: 'Sudhakar, Lead Software Consultant at Tarka Labs',
            image_url: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/000/1c8/2b3/3aa58e7.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Building a Real World React Redux App',
        abstract: 'In this talk I would like to share my experience on working with React.js and redux to build and deploy a front-end application, how to take your basic understanding of react and apply it to building UI components, how you can organise your application\'s data in your redux store and finally how to connect them together to do the magic.',
        authors: [
          {
            name : 'Alfred, Solution Consultant at Sahaj Software',
            image_url :'https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAkFAAAAJGY1ZTMwNjU5LWYxZDYtNDU0OS05MWI5LTk4NjdmNjg4N2YyMA.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-01-19T19:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Dinner and networking',
        abstract: '',
        authors: [],
        time: {
          start_time: new Date('2017-01-19T20:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/hackathon.jpg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '239567301',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Functional Programming',
    url: 'functional-programming',
    categories: ['events'],
    tags: ['javsacript', 'js', 'frontend', 'elixir'],
    author: 'devday_team',
    abstract: 'This time we are talking about functional programming with a hands on session.',
    event_time: {
      start_time: new Date('2017-05-06T10:30:00+05:30'),
      end_time: new Date('2017-05-06T13:00:00+05:30'),
    },
    publish_time: new Date('2017-05-02T09:30:00+05:30'),
    registration_time: {
      start_time: new Date('2017-05-02T09:30:00+05:30'),
      end_time: new Date('2017-05-18T13:00:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to functional programming',
        abstract: 'Introduction to functional programming using Elixir',
        authors: [
          {
            name: 'Navaneeth, Software Consultant, Sahaj',
            image_url: 'images/speakers/navneeth.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-05-06T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Hands-on functional programming',
        abstract: 'Hands-on session on functional programming using Scala',
        authors: [
          {
            name: 'Dileep Bapat, Software Consultant, Sahaj',
            image_url: 'images/speakers/dileep.jpg'
          }
        ],
        time: {
          start_time: new Date('2017-05-06T11:30:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#283593',
    image_url: 'images/events/functional_programming.jpg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '239660651',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  }
];
export default events;
