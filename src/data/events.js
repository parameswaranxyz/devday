"use strict";
var definitions_1 = require('./../definitions');
exports.BANGALORE_ADDRESS = {
    line_one: '#365, 3rd Floor, Sulochana Building',
    line_two: '1st Cross Road, 3rd Block, Sarjapura Main Road',
    locality: 'Koramangala',
    city: 'Bangalore',
    zip: 560034,
    map_link: 'https://goo.gl/maps/ziSASk4tmvM2',
    map_image: 'images/bangalore-map.jpg'
};
exports.CHENNAI_ADDRESS = {
    line_one: 'Sahaj Software Solutions Pvt. Ltd.',
    line_two: 'Type 2/15, Dr.V.S.I Estate, Rajiv Gandhi Salai',
    locality: 'Thiruvanmiyur',
    city: 'Chennai',
    zip: 600041,
    map_link: 'https://goo.gl/maps/7Z8iBAdjT1o',
    map_image: 'images/chennai-map.png'
};
exports.events = [
    {
        title: 'Technical Meetup',
        url: 'technical-meetup',
        categories: ['events'],
        tags: ['technology'],
        author: 'devday_ team',
        abstract: 'DEVDAY is a monthly informal event for developers to share their experiences, ideas, opinions, and perspectives, about technology.',
        event_time: {
            start_time: new Date('2016-03-05T10:30:00+05:30'),
        },
        publish_time: new Date('2016-03-05T10:30:00+05:30'),
        registration_time: {
            start_time: new Date('2016-03-05T10:30:00+05:30')
        },
        venue: exports.BANGALORE_ADDRESS,
        agenda: [
            {
                type: definitions_1.AgendaEntryType.Talk,
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
            },
            {
                type: definitions_1.AgendaEntryType.Break,
                time: {
                    start_time: new Date('2016-03-05T11:15:00+05:30')
                },
                title: 'Tea Break'
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
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
            },
            {
                type: definitions_1.AgendaEntryType.Break,
                time: {
                    start_time: new Date('2016-03-05T12:30:00+05:30')
                },
                title: 'Lunch Break'
            }
        ]
    },
    {
        title: 'Data science: How it helps',
        url: 'data-science-how-it-helps',
        categories: ['events'],
        tags: ['data-science'],
        author: 'devday_ team',
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
        venue: exports.BANGALORE_ADDRESS,
        agenda: [
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'Julia - A fresh approach to data science and technical computing',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: "Viral B. Shah",
                        image_url: 'images/speakers/viral-shah.jpg'
                    }
                ],
                time: {
                    start_time: new Date('2016-05-07T10:30:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Break,
                time: {
                    start_time: new Date('2016-04-02T11:15:00+05:30')
                },
                title: 'Tea Break'
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'Applied data science for developers',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: 'Unknown'
                    }
                ],
                time: {
                    start_time: new Date('2016-05-07T11:30:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Break,
                time: {
                    start_time: new Date('2016-05-07T13:00:00+05:30')
                },
                title: 'Lunch Break'
            }
        ]
    },
    {
        title: 'All about databases',
        url: 'all-about-databases',
        categories: ['events'],
        tags: ['databases', 'sqlite', 'event streams'],
        author: 'devday_ team',
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
        venue: exports.BANGALORE_ADDRESS,
        agenda: [
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'Databases: Days of the future past',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: "Avinash Nijampure"
                    }
                ],
                time: {
                    start_time: new Date('2016-06-04T10:30:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Break,
                time: {
                    start_time: new Date('2016-06-04T11:15:00+05:30')
                },
                title: 'Tea and snacks'
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'SQLite: Why aren\'t you using it more?',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: 'Srimathi Harinarayanan',
                        image_url: 'images/speakers/srimathi.jpg'
                    },
                    {
                        name: 'Navaneeth KN',
                        image_url: 'navneeth.jpg'
                    }
                ],
                time: {
                    start_time: new Date('2016-06-04T11:30:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'Databases as event streams',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: 'Shashank Teotia',
                        image_url: 'images/speakers/shashank-teotia.jpg'
                    }
                ],
                time: {
                    start_time: new Date('2016-06-04T12:15:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Break,
                time: {
                    start_time: new Date('2016-06-04T13:00:00+05:30')
                },
                title: 'Lunch'
            }
        ]
    },
    {
        title: 'Arduino Day',
        url: 'arduino-day',
        categories: ['events'],
        tags: ['arduino-genuino-iot'],
        author: 'devday_ team',
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
        venue: exports.BANGALORE_ADDRESS,
        agenda: [
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'Adventures with Arduino',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: "Himesh Reddivari",
                        image_url: 'images/speakers/himesh-reddivari.jpg'
                    }
                ],
                time: {
                    start_time: new Date('2016-04-02T10:30:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Break,
                time: {
                    start_time: new Date('2016-04-02T11:15:00+05:30')
                },
                title: 'Tea Break'
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'Journey of Samvid',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: 'Shashank Teotia',
                        image_url: 'images/speakers/shashank-teotia.jpg'
                    }
                ],
                time: {
                    start_time: new Date('2016-04-02T11:30:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'Simple obstacle avoiding Robot using Arduino',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: 'Deepak Nararyana Rao',
                        image_url: 'images/speakers/deepak.jpg'
                    }
                ],
                time: {
                    start_time: new Date('2016-04-02T12:15:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Workshop,
                title: 'Workshop on Arduino',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: 'Deepak Nararyana Rao',
                        image_url: 'images/speakers/deepak.jpg'
                    }
                ],
                time: {
                    start_time: new Date('2016-04-02T13:00:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Break,
                time: {
                    start_time: new Date('2016-06-04T13:45:00+05:30')
                },
                title: 'Lunch Break'
            }
        ]
    },
    {
        title: 'Cloud Computing',
        url: 'cloud-computing',
        categories: ['events'],
        tags: ['cloud computing', 'cloud'],
        author: 'devday_ team',
        abstract: 'Upload. Download. Dock. Serve. Functions on demand. Everything to do with the cloud.',
        event_time: {
            start_time: new Date('2016-07-09T10:30:00+05:30'),
            end_time: new Date('2016-07-09T13:30:00+05:30'),
        },
        publish_time: new Date('2016-07-09T10:30:00+05:30'),
        registration_time: {
            start_time: new Date('2016-07-09T10:30:00+05:30'),
            end_time: new Date('2016-07-09T10:30:00+05:30')
        },
        venue: exports.BANGALORE_ADDRESS,
        agenda: [
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'Product For Blue - <br>Green Deployments Verification',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: "Srikanth Seshadri",
                        image_url: 'images/speakers/srikanth.png'
                    }
                ],
                time: {
                    start_time: new Date('2016-07-09T10:30:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Break,
                time: {
                    start_time: new Date('2016-07-09T11:15:00+05:30')
                },
                title: 'Tea and snacks'
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'Misconceptions of cloud: Automation!',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: 'Arther Antony',
                        image_url: 'images/speakers/arther.png'
                    }
                ],
                time: {
                    start_time: new Date('2016-07-09T11:30:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
                title: 'Introduction to DevOps, the pain-points and the frameworks',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: 'Raghavendrra Mahesh',
                        image_url: 'images/speakers/mahesh.png'
                    }
                ],
                time: {
                    start_time: new Date('2016-07-09T12:15:00+05:30')
                }
            },
            {
                type: definitions_1.AgendaEntryType.Break,
                time: {
                    start_time: new Date('2016-07-09T13:00:00+05:30')
                },
                title: 'Lunch Break'
            }
        ],
        color: 'black',
        image_url: 'images/events/cloud_computing.jpg'
    },
    {
        title: 'JS Everywhere',
        url: 'js-everywhere',
        categories: ['events'],
        tags: ['js', 'javascript', 'react-native', 'cycle-js'],
        author: 'devday_ team',
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
        venue: exports.CHENNAI_ADDRESS,
        agenda: [
            {
                type: definitions_1.AgendaEntryType.Talk,
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
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
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
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
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
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
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
            }
        ],
        color: '#f7df1e',
        background_size: '200px',
        image_url: 'images/events/js_everywhere.png',
        meetup_urlname: 'devday_chennai',
        meetup_event_id: '232886624'
    },
    {
        title: 'Tasting Elixir',
        url: 'tasting-elixir',
        categories: ['events'],
        tags: ['elixir', 'functional programming', 'concurrent programming'],
        author: 'devday_ team',
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
        venue: exports.BANGALORE_ADDRESS,
        agenda: [
            {
                type: definitions_1.AgendaEntryType.Workshop,
                title: 'Hands-On with Elixir',
                abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in varius ante. Cras mattis ante sit amet nunc molestie faucibus. Sed luctus arcu in leo molestie, et laoreet nibh dictum. Donec nec massa pharetra, commodo sapien id, finibus dolor. Donec tempor ipsum nisl. Vivamus in viverra arcu. Curabitur vehicula mi in nunc tristique mollis. In vel justo scelerisque, mattis urna.',
                authors: [
                    {
                        name: "Navaneeth N",
                        image_url: 'images/speakers/navneeth.jpg'
                    }
                ],
                time: {
                    start_time: new Date('2016-08-27T10:30:00+05:30')
                }
            }
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
        tags: ['real-time', 'rtc', 'webrtc', 'peer-js'],
        author: 'devday_ team',
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
        venue: exports.CHENNAI_ADDRESS,
        agenda: [
            {
                type: definitions_1.AgendaEntryType.Talk,
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
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
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
            },
            {
                type: definitions_1.AgendaEntryType.Talk,
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
            },
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
        title: 'Hackathon',
        url: 'hackathon',
        categories: ['events'],
        tags: ['hackathon', 'hack day'],
        author: 'devday_ team',
        abstract: '',
        event_time: {
            start_time: new Date('2016-09-24T10:30:00+05:30'),
            end_time: new Date('2016-09-24T10:00:00+05:30'),
        },
        publish_time: new Date('2016-09-07T17:45:00+05:30'),
        registration_time: {
            start_time: new Date('2016-09-07T17:45:00+05:30'),
            end_time: new Date('2016-09-24T09:45:00+05:30'),
        },
        venue: exports.BANGALORE_ADDRESS,
        agenda: [
            {
                type: definitions_1.AgendaEntryType.Hackathon,
                title: 'Hackathon Begins!',
                abstract: '',
                authors: [],
                time: {
                    start_time: new Date('2016-08-04T10:00:00+05:30')
                }
            }
        ],
        color: '#211b33',
        meetup_urlname: 'devday_bangalore',
        meetup_event_id: '233530425',
        form: {
            url: 'https://docs.google.com/forms/d/e/1FAIpQLSfzUp2QaYh5m3MSB80DoDZvmVOFqU8lTA7NJnSMjU968PZQUg/formResponse',
            name: 'entry.1835601702',
            email: 'entry.190890788',
            mobile: 'entry.1343889675'
        }
    },
];
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.events;
//# sourceMappingURL=events.js.map