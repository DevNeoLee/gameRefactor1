export const states = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

const data = {
    "title": "Post-Exercise Survey",
    "description": "Please answer the following questions about your experience.",
    "questions": [
        {
            "id": "1",
            "question": "Which of the following categories does your age fall into?",
            "type": "radio",
            "choices": ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65 or older"],
        },
        {
            "id": "2",
            "question": "With which gender do you most identify?",
            "type": "radio",
            "choices": ["Woman", "Man", "Non-binary or Gender diverse"],
        },
        {
            "id": "3",
            "question": "In which state do you currently live?",
            "type": "select",
            "choices": states,
        },
        {
            "id": "4",
            "question": "What is the highest level of school you have completed or the highest degree you have received?",
            "type": "radio",
            "choices": [
                "Less than high school degree",
                "High school degree or equivalent (e.g., GED)",
                "Some college but no degree",
                "Associate degree",
                "Bachelor's degree",
                "Graduate degree"
            ],
        },
        {
            "id": "5",
            "question": "Which of these describes your personal income last year?",
            "type": "radio",
            "choices": [
                "$9,999 or Less",
                "$10,000 – 19,999",
                "$20,000 – 29,999",
                "$30,000 – 39,999",
                "$40,000 – 49,999",
                "$50,000 – 74,999",
                "$75,000 – 99,999",
                "$100,000 – 149,999",
                "$150,000 – 249,999",
                "$250,000 or More"
            ],
        },
        {
            "id": "6",
            "question": "During the next 12 months, how likely is it that you will be able to make all of your (electricity/water/rent) payments on time?",
            "type": "radio",
            "choices": [
                "Not likely at all",
                "Slightly likely",
                "Moderately likely",
                "Very likely",
                "Extremely likely"
            ],
        },
        {
            "id": "7",
            "question": "Which of the following best describes your political views?",
            "type": "radio",
            "choices": [
                "Extremely liberal",
                "Moderately liberal",
                "Slightly liberal",
                "Neither liberal nor conservative",
                "Slightly conservative",
                "Moderately conservative",
                "Extremely conservative"
            ],
        },
        {
            "id": "8",
            "question": "Which income tax structure in the United States do you prefer?",
            "choices": [
                "A tax rate that is the same for everyone, regardless of income or wealth",
                "A tax system where people with more income pay more in taxes"
            ],
        },
        {
            "id": "9",
            "question": "Please state your level of agreement for the following: There should be policies to resolve the gap between the rich and the poor.",
            "type": "radio",
            "choices": [
                "Completely agree",
                "Somewhat agree",
                "Neutral",
                "Somewhat disagree",
                "Completely disagree"
            ],
        },
        {
            "id": "10",
            "question": "In general, would you say people mostly look out for themselves, or do they mostly try to be helpful?",
            "type": "radio_scale",
            "scales": ["0 = People mostly look out for themselves", "10 = People mostly try to be helpful"],  
            "choices": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        {
            "id": "11",
            "question": "Let's revisit the very first round of this exercise: What were your initial expectations regarding how likely other participants were to invest in the public levee?",
            "choices": [
                "Expected that others were <strong style='font-size: 1.3rem;'>not likely</strong> to invest in the public levee",
                "Expected that others were <strong style='font-size: 1.3rem;'>slightly likely</strong> to invest in the public levee",
                "Expected that others were <strong style='font-size: 1.3rem;'>moderately likely</strong> to invest in the public levee",
                "Expected that others were <strong style='font-size: 1.3rem;'>very likely</strong> to invest in the public levee",
                "Expected that others were <strong style='font-size: 1.3rem;'>extremely likely</strong> to invest in the public levee"
            ],
        },
        {
            "id": "12",
            "question": "Based on your response to Question 11, how closely did your initial expectations about other participants' likelihood of investing in the public levee match what you actually observed?",
            "type": "radio",
            "choices": [
                "Not matched at all",
                "Slightly matched",
                "Moderately matched",
                "Strongly matched",
                "Very strongly matched"
            ],
        },
        {
            "id": "13",
            "question": "Based on your response to Question 12, how much did the degree of match between your expectations and observations influence your subsequent decisions?",
            "type": "radio",
            "choices": [
                "Not significant at all",
                "Slightly significant",
                "Moderately significant",
                "Very significant",
                "Extremely significant"
            ],
        }
    ]
}

export default data;
