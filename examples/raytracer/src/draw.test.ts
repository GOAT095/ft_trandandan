import { n_equal, vector_equal, vector_add, vector_sub} from "./vector";

test('n_equal precision: ', () => {
    expect(n_equal(0.0000005, 0.0000006)).toBeTruthy()

});

test('vector equal', () => {
    expect(vector_equal(
        {x: 0, y: 0, z : 0, w: 0}, {x: 0, y: 0, z: 0, w: 0}
        ));
});

test('vector add', () => {
    expect(
    vector_equal(
        vector_add(
        {x: 0, y: 0, z: 0, w: 0},
        {x: 1, y: 2, z: 3, w: 1}),
        {x: 1, y: 2, z: 3, w: 1}),
        ).toBeTruthy()
});

test('vector sub', () => {
    expect(
        vector_equal(
            vector_sub(
                {x: 0, y: 1, z: 1, w: 0},
                {x: 1, y: 2, z: 4, w: 0}
            ),
            {x: -1,y: -1, z: -3, w: 0}
        )
    )
});