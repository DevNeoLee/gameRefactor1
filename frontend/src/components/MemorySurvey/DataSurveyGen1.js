const data = {
    "title": "What Do You Remember? — A Survey",
    "instructions": "We’d like to ask you a few questions about what you remember from the exercise. As you answer, think back to both what you experienced firsthand and what you learned through conversations with your fellow villagers.",
    "questions": [
        {
            "id": "1",
            "question": "Thinking back, what would you say was the average peak river height?",
            "type": "radio",
            "choices": ["7 feet", "8 feet", "9 feet", "10 feet", "11 feet", "12 feet", "13 feet"],
        },
        {
            "id": "2",
            "question": "Based on your memory, what stands out as the highest peak river height you can recall?",
            "type": "radio",
            "choices": ["9 feet", "10 feet", "11 feet", "12 feet", "14 feet", "16 feet", "18 feet"],
        },
        {
            "id": "3",
            "question": "Thinking back, which range best represents the average flood loss (in %) you remember?",
            "type": "radio",
            "choices": ["0–10%", "11–20%", "21–30%", "31–50%", "51–70%", "71–90%", "91–100%"],
        },
        {
            "id": "4",
            "question": "Based on your recollection, what range best represents the most severe flood loss (in %) that you remember?",
            "type": "radio",
            "choices": ["0%", "10%", "30%", "50%", "70%", "90%", "100%"],
        },
        {
            "id": "5",
            "question": "When the most severe flood loss you mentioned in Question 4 occurred, what do you recall the river's peak height was at that time?",
            "type": "radio",
            "choices": ["9 feet", "10 feet", "11 feet", "12 feet", "14 feet", "16 feet", "18 feet"],
        },
        {
            "id": "6",
            "question": "When the most severe flood loss you mentioned in Question 4 occurred, what do you recall the levee height was at that time?",
            "type": "radio",
            "choices": ["0–2 feet", "4 feet", "6 feet", "8 feet", "10 feet", "12 feet", "14–16 feet"],
        }
    ]
}

export default data;
