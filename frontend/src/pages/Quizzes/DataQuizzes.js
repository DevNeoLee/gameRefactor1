const data = {
    "title": "Pre Quiz",
    "questions": [
        {
            "id": "1",
            "question": "Which of the following is TRUE about your group and the overall setting?",
            "choices": [
                "There are five villagers in my group.",
                "A river runs through a village, bringing valuable benefits but also the risk of flooding.",
                "Both of the above."
            ],
            "answer": "c",
            "comment": "Hint: You are participating in a 5-player game where each player acts as a villager deciding to build wealth near or far from a river. The river provides valuable benefits but also poses a flood risk.",
            "hint": "Hint: You are participating in a 5-player game where each player acts as a villager deciding to build wealth near or far from a river. The river provides valuable benefits but also poses a flood risk."
        },
        {
            "id": "2",
            "question": "Which of the following is FALSE about a villager's decision?",
            "choices": [
                "Before making a decision in a round, each villager can see the other villagers' decisions for that round.",
                "Each villager is endowed with 10 tokens at the beginning of each round.",
                "Each villager can use their endowed tokens to build wealth either near the river or farther away from it."
            ],
            "answer": "a",
            "comment": "Hint: At the beginning of each round, each villager receives 10 tokens to allocate between two options: building wealth near the river or farther away from it. All villagers make their decisions simultaneously and independently, meaning no one can see the others' choices before making their own.",
            "hint": "Hint: At the beginning of each round, each villager receives 10 tokens to allocate between two options: building wealth near the river or farther away from it. All villagers make their decisions simultaneously and independently, meaning no one can see the others' choices before making their own."
        },
        {
            "id": "3",
            "question": "Which of the following is TRUE about a villager's decision when choosing to build wealth farther away from the river?",
            "choices": [
                "When a villager chooses to build wealth far from the river in a round, they allocate all of their 10 tokens to the far area and earn a fixed return of 11 tokens.",
                "When a villager chooses to build wealth far from the river in a round, they invest zero tokens in the public levee.",
                "Both of the above."
            ],
            "answer": "c",
            "comment": "Hint: Villagers who build wealth far from the river do not invest in the public levee. They allocate all 10 tokens to the far area and receive a fixed return of 11 tokens, without being affected by flooding.",
            "hint": "Hint: Villagers who build wealth far from the river do not invest in the public levee. They allocate all 10 tokens to the far area and receive a fixed return of 11 tokens, without being affected by flooding."
        },
        {
            "id": "4",
            "question": "Which of the following is TRUE about a villager's decision when choosing to build wealth near the river?",
            "choices": [
                "When a villager chooses to build wealth near the river in a round, they split their tokens between contributing to the public levee and growing their private wealth.",
                "When a villager chooses to build wealth near the river in a round, at least one token is invested in the public levee by default.",
                "Both of the above."
            ],
            "answer": "c",
            "comment": "Hint: When a villager chooses to build wealth near the river, they must divide their tokens between contributing to the public levee and growing their private wealth. Also, when choosing to build wealth near the river, at least one token is allocated to the public levee by default.",
            "hint": "Hint: When a villager chooses to build wealth near the river, they must divide their tokens between contributing to the public levee and growing their private wealth. Also, when choosing to build wealth near the river, at least one token is allocated to the public levee by default."
        },
        {
            "id": "5",
            "question": "Which of the following is FALSE about the peak river height and flood loss?",
            "choices": [
                "The peak river height can VARY from round to round and IS NOT AFFECTED by how many tokens your group contributes to the public levee.",
                "The flood loss rate (%) remains constant, regardless of how much the peak river height exceeds or overtops the levee height.",
                "The levee height can VARY from round to round and IS AFFECTED by the number of tokens your group contributes to the public levee."
            ],
            "answer": "b",
            "comment": "Hint: The peak river height is unpredictable and can change from round to round. Flooding happens when the river rises higher than the levee. The flood loss rate can change because it depends on how much higher the river height is compared to the levee height. The levee height is affected by the number of tokens your group contributes to the public levee, while the peak river height is not.",
            "hint": "Hint: The peak river height is unpredictable and can change from round to round. Flooding happens when the river rises higher than the levee. The flood loss rate can change because it depends on how much higher the river height is compared to the levee height. The levee height is affected by the number of tokens your group contributes to the public levee, while the peak river height is not."
        },
        {
            "id": "6",
            "question": "Which of the following is TRUE about the public levee and flood loss?",
            "choices": [
                "The levee stock naturally declines by 25 tokens at the end of each round, causing the levee height to decrease accordingly. However, there is a minimum levee stock level of 30 tokens, and it will NEVER fall below this threshold.",
                "Investing enough tokens in the public levee each round will likely reduce flood risk by increasing the levee height. But this increase has a limit and will not continue indefinitely.",
                "Both of the above."
            ],
            "answer": "c",
            "comment": "Hint: The public levee protects the wealth of villagers who have invested near the river by reducing the risk of flood loss. Contributing more tokens to the levee increases the levee stock (and therefore its height), making flooding less likely. However, the levee stock naturally declines by 25 tokens at the end of each round, causing the height to drop. That said, the levee stock will never fall below a minimum level of 30 tokens. Additionally, the levee height has an upper limit and cannot increase indefinitely, even with continuous investment.",
            "hint": "Hint: The public levee protects the wealth of villagers who have invested near the river by reducing the risk of flood loss. Contributing more tokens to the levee increases the levee stock (and therefore its height), making flooding less likely. However, the levee stock naturally declines by 25 tokens at the end of each round, causing the height to drop. That said, the levee stock will never fall below a minimum level of 30 tokens. Additionally, the levee height has an upper limit and cannot increase indefinitely, even with continuous investment."
        },
        {
            "id": "7",
            "question": "Suppose that a villager chooses to build wealth near the river and invests 4 tokens in the public levee. Which of the following is FALSE about this villager's payoff?",
            "choices": [
                "The remaining 6 tokens (=10 – 4) are allocated to grow the villager's private wealth.",
                "The remaining 6 tokens allocated to private wealth are multiplied by 3, resulting in potential earnings of 18 tokens (6 × 3) for the villager. If flooding does not occur, these 18 tokens will be confirmed as the villager's earnings for that round.",
                "The remaining 6 tokens are tripled, resulting in 18 tokens (=6 × 3). This amount will remain intact and serve as the villager's final earnings for the round, even if flooding occurs"
            ],
            "answer": "c",
            "comment": "Hint: If a villager invests 4 tokens into the public levee, the remaining 6 tokens are used to grow private wealth near the river. The 6 tokens invested in private wealth are tripled, resulting in potential earnings of 18 tokens (6 × 3) for the villager. If no flood occurs, the villager earns the full 18 tokens for that round. However, if flooding happens, these 18 tokens will be reduced by the flood loss rate (i.e., they will not remain intact).",
            "hint": "Hint: If a villager invests 4 tokens into the public levee, the remaining 6 tokens are used to grow private wealth near the river. The 6 tokens invested in private wealth are tripled, resulting in potential earnings of 18 tokens (6 × 3) for the villager. If no flood occurs, the villager earns the full 18 tokens for that round. However, if flooding happens, these 18 tokens will be reduced by the flood loss rate (i.e., they will not remain intact)."
        },
        {
            "id": "8",
            "question": "Which of the following is TRUE about the villagers’ earnings and flood loss rate (%)?",
            "choices": [
                "If flooding occurs in a round, the resulting flood loss rate (%) reduces the earnings from that round for villagers who chose to build wealth far from the river.",
                "If flooding occurs in a round, the resulting flood loss rate (%) reduces ONLY THE EARNINGS FROM THAT ROUND for villagers who chose to build wealth near the river.",
                "If flooding occurs in a round, the resulting flood loss rate (%) reduces ALL CUMULATIVE earnings of villagers who chose to build wealth near the river in that round."
            ],
            "answer": "b",
            "comment": "Hint: Flooding only affects villagers who chose to build wealth near the river. If this happens, the flood loss rate (%) reduces only the earnings from that round for villagers who chose to build wealth near the river.  Their earnings from previous rounds are unaffected. Note that flooding does not affect the earnings of villagers who chose to build wealth far from the river.",
            "hint": "Hint: Flooding only affects villagers who chose to build wealth near the river. If this happens, the flood loss rate (%) reduces only the earnings from that round for villagers who chose to build wealth near the river.  Their earnings from previous rounds are unaffected. Note that flooding does not affect the earnings of villagers who chose to build wealth far from the river."
        }
    ]
};

export default data;