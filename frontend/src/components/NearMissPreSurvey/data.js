export const states = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

const data = {
    "title": "A Pre-Exercise Survey",
    "description": "We would like to ask you a few questions about how you perceive and remember the details of another group's experience you've just seen.",
    "questions": [
        {
            "id": "1",
            "question": "Reflect on the past event just described to you in connection with the exercise. To what extent was it a serious or harmful incident that \"almost occurred\"?",
            "type": "radio_scale",
            "scales": ["(not at all)", "(very much)"],
            "choices": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        {
            "id": "2",
            "question": "How \"close\" was the described event to being a disaster?",
            "type": "radio_scale",
            "scales": ["(not at all close)", "(extremely close)"],
            "choices": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        {
            "id": "3",
            "question": "To what extent were villagers just lucky that a harmful incident did not happen?",
            "type": "radio_scale",
            "scales": ["(not at all lucky)", "(extremely lucky)"],
            "choices": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        {
            "id": "4",
            "question": "To what extent was it just a chance that a disaster did not happen?",
            "type": "radio_scale",
            "scales": ["(not at all chance)", "(extremely reliant on chance)"],
            "choices": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        {
            "id": "5",
            "question": "How great a risk does the described event pose to you as a villager preparing to take part in the same decision exercise?",
            "type": "radio_scale",
            "scales": ["(no risk)", "(extremely risky)"],
            "choices": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        {
            "id": "6",
            "question": "How great a risk does the described event pose to society at large?",
            "type": "radio_scale",
            "scales": ["(no risk)", "(extremely risky)"],
            "choices": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        {
            "id": "7",
            "question": "To what extent did you think learning about the described event would make you change future behaviors?",
            "type": "radio_scale",
            "scales": ["(no change to future behaviors)", "(completely change future behaviors)"],
            "choices": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        {
            "id": "8",
            "question": "In light of the described event, how willing are you to participate in efforts within the exercise that aim to reduce similar future risks in your village or group?",
            "type": "radio_scale",
            "scales": ["(not at all willing)", "(extremely willing)"],
            "choices": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        {
            "id": "9",
            "question": "Again, think back to the past event just described to you in connection with the exercise. According to your memory of the described event, what is the average levee height needed to manage flood risk?",
            "type": "radio",
            "choices": [
                "8 feet",
                "9 feet",
                "10 feet",
                "11 feet",
                "12 feet",
                "13 feet",
                "14 feet",
                "15 feet",
                "16 feet",
                "17 feet",
                "18 feet"
            ],
        },
        {
            "id": "10",
            "question": "According to your memory of the described event, what was the highest height the river rose to during the event?",
            "type": "radio",
            "choices": [
                "7 feet",
                "8 feet",
                "9 feet",
                "10 feet",
                "11 feet",
                "12 feet",
                "13 feet",
                "14 feet",
                "15 feet",
                "16 feet",
                "17 feet"
            ],
        },
        {
            "id": "11",
            "question": "According to your memory of the described event, what was the levee height in place in your (focal) village during the event?",
            "type": "radio",
            "choices": [
                "0 feet",
                "2 feet",
                "4 feet",
                "6 feet",
                "8 feet",
                "10 feet",
                "12 feet",
                "14 feet",
                "16 feet",
                "18 feet",
                "20 feet"
            ],
        },
        {
            "id": "12",
            "question": "According to your memory of the described event, what was the flood loss (%) experienced by your (focal) village (i.e., not the other village located a few miles away) during the event?",
            "type": "radio",
            "choices": [
                "0% flood loss (no damage)",
                "10% flood loss",
                "20% flood loss",
                "30% flood loss",
                "40% flood loss",
                "50% flood loss",
                "60% flood loss",
                "70% flood loss",
                "80% flood loss",
                "90% flood loss",
                "100% flood loss (most severe damage)"
            ],
        }
    ]
}

export default data;