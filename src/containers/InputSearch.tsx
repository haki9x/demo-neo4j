import React, { useEffect } from 'react';
import { TextField, Autocomplete, ListItem, IconButton, styled, CircularProgress, Paper } from '@mui/material';
import styles from './InputSearch.module.scss';
import { Padding } from '@mui/icons-material';

const CustomTextField = styled(TextField)(() => ({
    '& .MuiInputBase-root': { color: '#ffffff' },
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#1d1a29',
        borderColor: '#bbb',
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
        '& fieldset': { borderColor: '#bbb' },
        '&:hover fieldset': { borderColor: '#fff' },
        '&.Mui-focused fieldset': { borderColor: '#f00' },
    },
    '& .MuiInputLabel-root': { color: '#ffffff' },
    '& .MuiInputBase-input': { padding: '10px 12px' },
    '& .MuiAutocomplete-inputRoot': { color: '#fff' },
    '& .MuiAutocomplete-listbox': { backgroundColor: '#2a2a2a', color: '#fff' },
    '& .MuiAutocomplete-option': {
        backgroundColor: '#333',
        '&:hover': { backgroundColor: '#444' },
    },
}));

interface InputSearchProps<T> {
    data: T[];
    searchTerm: string | undefined;
    onSearchTermChange: (value: string) => void;
    onOptionSelect: (value: T | null) => void;
    getOptionLabel: (option: T) => string;
    getOptionShowInput: (option: T) => string;
    loading?: boolean;
    defaultValue?: T | null;
    label?: string | "";
}

function InputSearch<T extends { id?: string | number }>(props: InputSearchProps<T>) {
    const { data, searchTerm, onSearchTermChange, onOptionSelect, getOptionLabel, loading = false, label, getOptionShowInput, defaultValue } = props;
    // console.log("InputSearch.:", defaultValue, searchTerm)
    return (
        <div className={styles.neo4jContainer}>
            <Autocomplete
                inputValue={searchTerm}
                // defaultValue={defaultValue}
                {...(defaultValue !== undefined ? { defaultValue } : {})}
                onInputChange={(event, newValue) => { newValue !== "undefined" && onSearchTermChange(newValue) }}
                options={data}
                getOptionLabel={getOptionShowInput}
                isOptionEqualToValue={(option, value) => getOptionLabel(option) === getOptionLabel(value)}
                renderInput={(params) => (
                    <CustomTextField
                        {...params}
                        label={label}
                        variant="outlined"
                        fullWidth
                    />
                )}
                renderOption={(props, option) => (
                    <ListItem {...props} key={(option.id ?? getOptionLabel(option))} className={styles.listItem}>
                        {getOptionLabel(option)}
                    </ListItem>
                )}
                sx={{
                    '& .MuiAutocomplete-endAdornment': {
                        color: '#ffffff', // Set your desired icon color here
                    },
                    '& .MuiAutocomplete-clearIndicator': {
                        color: 'red', // Set clear icon color
                    },
                    '& .MuiAutocomplete-popupIndicator': {
                        color: '#ffffff', // Set dropdown arrow color
                    },
                }}
                PaperComponent={(paperProps) => (
                    <Paper {...paperProps} sx={{ backgroundColor: '#1d1a29' }} />
                  )}
                loading={loading}
                noOptionsText="Không có dữ liệu"
                onChange={(event, newValue) => onOptionSelect(newValue)}
            />
            {loading && <CircularProgress />}
        </div>
    );
}

export default InputSearch;
